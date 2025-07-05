//@ts-check
/// <reference path="./types/custom.d.ts" />

// ==========================================================================================
// Main JavaScript entry point for KubeView
// Handles the main cytoscape graph and data load from the server
// Provides functions to add, update, and remove resources from the graph
// ==========================================================================================
import Alpine from '../ext/alpinejs.esm.min.js'

import { getConfig, saveConfig } from './config.js'
import { getClientId, initEventStreaming } from './events.js'
import { addResource, processLinks, layout, clearCache, tempShit } from './graph.js'
import { showToast } from '../ext/toast.js'
import sidePanel from './side-panel.js'
import eventsDialog from './events-dialog.js'

// @ts-ignore
export const graph = new G6.Graph({
  container: 'mainView',
  data: {},
  autoFit: 'view',
  zoomRange: [0.2, 10],
  padding: 20,

  node: {
    type: 'image',
    style: {
      size: 100,
      labelFill: '#cccccc',
      labelFontSize: 20,
      labelPlacement: 'bottom',
      stroke: '#fff',
      lineWidth: 2,
      fillOpacity: 0.5,
      cursor: 'pointer',
      haloStroke: '#3153D5',
    },
    state: {
      selected: {
        halo: true,
        haloLineWidth: 12,
        haloStrokeOpacity: 0.8,
        labelFontSize: 20,
      },
    },
  },

  edge: {
    type: 'cubic-vertical',
    style: {
      endArrow: true,
      lineWidth: 2.5,
      stroke: '#666',
    },
  },

  layout: {
    type: 'antv-dagre',
    rankdir: 'TB',
    ranker: 'network-simplex',
    animation: false,
    preLayout: true,
  },

  behaviors: [
    'drag-canvas',
    'drag-element',
    {
      type: 'zoom-canvas',
      sensitivity: 0.4,
    },
    {
      type: 'click-select',
      key: 'click-select-1',
      unselectedState: 'unselected',
    },
  ],
})

window.addEventListener('resize', async function () {
  graph.resize()
  await graph.fitView()
})

// Set up the event streaming for live updates once the DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
  initEventStreaming()
})

export const channel = new BroadcastChannel('kubeview')

// Alpine.js component for the main application
Alpine.data('mainApp', () => ({
  // ===== Application state ================================
  errorMessage: '',
  /** @type {string[] | null} */
  namespaces: null,
  namespace: '',
  showWelcome: true,
  isLoading: false,
  showConfigDialog: false,
  configTab: 1,
  cfg: getConfig(),
  searchQuery: '',
  showEventsDialog: false,
  showLogsDialog: false,
  logs: '',

  /** @type {Record<string, string>} */
  serviceMetadata: {
    clusterHost: '',
    version: '',
    buildInfo: '',
    clusterMode: '',
  },

  // ===== Functions ============================================

  /**
   * All app initialization logic is here, called automatically by Alpine.js
   */
  async init() {
    console.log('🚀 Initializing KubeView...')
    console.log(`🙍 ClientID ${getClientId()}`)

    // Listen for messages from the BroadcastChannel, just to warn about namespace changes
    channel.onmessage = (event) => {
      if (event.data.type === 'namespaceChange') {
        showToast(`Namespace was changed on a different tab<br>you will no longer see live updates here!`, 5000, 'top-center', 'warning')
      }
    }

    // These two handlers syncs us with the EventSource in events.js
    window.addEventListener('reconnect', () => {
      showToast('Reconnected to the server!<br>Resuming live updates', 3000, 'top-center', 'success')
      this.fetchNamespace()
    })

    window.addEventListener('disconnect', () => {
      showToast('Disconnected from the server!<br>Live updates are paused', 3000, 'top-center', 'error')
    })

    // Listen for resource addition events, and re-run the search & filtering
    // TODO: cy.on('add', () => this.filterView(this.searchQuery))

    this.$watch('namespace', () => {
      console.log(`🔄 Namespace changed to: ${this.namespace}`)

      this.fetchNamespace()

      // This is a workaround to notify other tabs about the namespace change
      channel.postMessage({ type: 'namespaceChange', namespace: this.namespace })
    })

    this.$watch('searchQuery', (query) => this.filterView(query))

    // Check if the URL has a namespace parameter
    const urlParams = new URLSearchParams(window.location.search)
    const queryNs = urlParams.get('ns') || ''
    if (queryNs) {
      this.showWelcome = false
      this.namespace = queryNs
    }

    // Load the initial namespaces
    await this.refreshNamespaces()

    // Handle post layout event to show a toast if no nodes are present
    graph.on(G6.GraphEvent.AFTER_LAYOUT, () => {
      if (graph.getNodeData().length === 0) {
        showToast('No resources found in this namespace<br>Check your filter settings', 3000, 'top-center', 'warning')
      }
    })
  },

  /**
   * Fetch the list of namespaces from the server
   */
  async refreshNamespaces() {
    let res
    try {
      res = await fetch('api/namespaces')
      if (!res.ok) throw new Error(`HTTP error ${res.status}: ${res.statusText}`)

      const data = await res.json()
      this.namespaces = data.namespaces || []
      this.serviceMetadata.clusterHost = data.clusterHost || ''
      this.serviceMetadata.version = data.version || ''
      this.serviceMetadata.buildInfo = data.buildInfo || ''
      this.serviceMetadata.clusterMode = data.mode || ''

      // if single namespace is returned, set it as the current namespace
      if (this.namespaces && this.namespaces.length === 1) {
        this.namespace = this.namespaces[0]
      }
    } catch (err) {
      this.showError(`Failed to fetch namespaces: ${err.message}`, res)
      return
    }

    console.log(`📚 Found ${this.namespaces ? this.namespaces.length : 0} namespaces in cluster`)
  },

  /**
   * Display an error message in the UI and log it to the console
   * @param {string} message
   * @param {Object} res
   */
  showError(message, res) {
    this.errorMessage = message
    if (!res) {
      console.error(message)
    } else {
      res.json().then((data) => {
        this.errorMessage += `<pre>${JSON.stringify(data, null, 2) || 'No additional error information provided'}<pre>`
        console.error('API error', data)
      })
    }

    this.showWelcome = false
    this.isLoading = false
  },

  /**
   * Main function to fetch & parse the namespace data and populate the graph
   * This will clear the current graph and load new data from the server
   */
  async fetchNamespace() {
    this.errorMessage = ''

    if (this.isLoading) {
      console.warn('⚠️ Fetch already in progress, ignoring new request')
      return
    }

    this.searchQuery = ''
    this.isLoading = true

    window.history.replaceState({}, '', `?ns=${this.namespace}`)
    await graph.clear()
    await graph.fitView()

    let data
    let res
    try {
      res = await fetch(`api/fetch/${this.namespace}?clientID=${getClientId()}`)
      if (!res.ok) throw new Error(`HTTP error ${res.status}: ${res.statusText}`)
      data = await res.json()

      this.isLoading = false
      this.showWelcome = false
    } catch (err) {
      this.showError(`Failed to fetch namespace data: ${err.message}`, res)
      return
    }

    if (this.cfg.debug) {
      console.log('📦 Fetched data:', data)
    }

    // Important: Clear the cache before adding new resources
    clearCache()

    // Pass 1 - Add ALL the resources to the graph
    for (const kindKey in data) {
      const resources = data[kindKey]
      for (const res of resources || []) {
        addResource(res)
      }
    }

    // Pass 2 - Add links between using metadata.ownerReferences
    for (const kindKey in data) {
      const resources = data[kindKey]
      for (const res of resources || []) {
        processLinks(res)
      }
    }

    try {
      await graph.render()
    } catch (e) {
      console.error('💥 Error rendering graph:', e)
      return
    }
  },

  /**
   * Search for resources in the graph based on a query string
   * @param {string} query
   */
  filterView(query) {
    query
    // const q = query.trim().toLowerCase()
    // if (q.length === 0) {
    //   // If the search query is empty, show everything
    //   cy.elements().style({
    //     display: 'element',
    //     visibility: 'visible',
    //   })
    //   hideToast(20)
    //   this.toolbarFit()
    //   return
    // }
    // const visCountBefore = cy.$(':visible').length
    // // Set all nodes that match the search query to be visible
    // // And hide all nodes that do not match
    // const result = cy.$('node[label*="' + q + '"]')
    // result.style({
    //   display: 'element',
    //   visibility: 'visible',
    // })
    // result.symdiff('node').style({
    //   display: 'none',
    //   visibility: 'hidden',
    // })
    // const visCountAfter = cy.$(':visible').length
    // if (visCountAfter <= 0) {
    //   showToast('No resources found matching the search query', 2000, 'top-center')
    // } else {
    //   hideToast(20)
    // }
    // if (visCountBefore != visCountAfter) {
    //   this.toolbarFit()
    // }
  },

  // Save settings to the config
  configDialogSave() {
    saveConfig(this.cfg)
    this.showConfigDialog = false
    showToast('Configuration saved successfully', 3000, 'top-center', 'success')
    this.fetchNamespace()
  },

  async toolbarFit() {
    await graph.fitView()
  },

  toolbarTreeLayout: layout,

  async toolbarSavePNG() {
    const imageData = await graph.toDataURL({
      type: 'image/png',
    })

    const a = document.createElement('a')
    a.href = imageData
    a.download = `kubeview-${this.namespace}.png`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(imageData)
  },

  showLogs() {
    console.log('Show logs for', this.panelData.id)
  },
}))

// Register sub child-components
Alpine.data('sidePanel', sidePanel)
Alpine.data('eventsDialog', eventsDialog)

// Initialize & start!
Alpine.start()
