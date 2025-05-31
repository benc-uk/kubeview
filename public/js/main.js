//@ts-check

// ==========================================================================================
// Main JavaScript entry point for KubeView
// Handles the main cytoscape graph and data load from the server
// Provides functions to add, update, and remove resources from the graph
// ==========================================================================================
import cytoscape from '../ext/cytoscape.esm.min.mjs'
import Alpine from '../ext/alpinejs.esm.min.js'

import { getConfig, saveConfig } from './config.js'
import { getClientId, initEventStreaming } from './events.js'
import { styleSheet } from './styles.js'
import { addResource, processLinks, layout, coseLayout } from './graph.js'
import { hideToast, showToast } from '../ext/toast.js'

// A shared global map of resources by their UID, used in a bunch of places
export const resMap = {}

// This is why we are here, Cytoscape will be used to render all the data
export const cy = cytoscape({
  container: document.getElementById('mainView'),
  style: styleSheet,
})

window.addEventListener('resize', function () {
  cy.resize()
  cy.fit(null, 10)
})

// Set up the event streaming for live updates once the DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
  initEventStreaming()
})

const bc = new BroadcastChannel('kubeview')

// Alpine.js component for the main application
Alpine.data('mainApp', () => ({
  // ===== Application state ================================
  panelShowLabels: false,
  panelOpen: false,
  /** @type {PanelData} */
  panelData: {
    id: '',
    kind: 'default',
    icon: 'default',
    props: {},
    containers: {},
    labels: {},
  },
  errorMessage: '',
  /** @type {string[] | null} */
  namespaces: null,
  namespace: '',
  showWelcome: true,
  isLoading: false,
  clientId: getClientId(),
  showConfigDialog: false,
  configTab: 1,
  cfg: getConfig(),
  /** @type {Record<string, string>} */
  serviceMetadata: {
    clusterHost: '',
    version: '',
    buildInfo: '',
  },
  searchQuery: '',

  // ===== Functions ============================================

  // All app initialization logic is here
  async init() {
    console.log('🚀 Initializing KubeView...')
    console.log(`🙍 ClientID ${this.clientId}`)

    // Listen for messages from the BroadcastChannel, just to warn about namespace changes
    bc.onmessage = (event) => {
      if (event.data.type === 'namespaceChange') {
        showToast(`Namespace was changed on a different tab<br>you will no longer see live updates here!`, 5000, 'top-center')
      }
    }

    this.$watch('namespace', () => {
      console.log(`🔄 Namespace changed to: ${this.namespace}`)

      this.fetchNamespace()

      // This is a workaround to notify other tabs about the namespace change
      bc.postMessage({ type: 'namespaceChange', namespace: this.namespace })
    })

    this.$watch('searchQuery', (query) => this.search(query))

    // Check if the URL has a namespace parameter, then automatically set it
    const urlParams = new URLSearchParams(window.location.search)
    const queryNs = urlParams.get('ns') || ''
    if (queryNs) {
      this.showWelcome = false
      this.namespace = queryNs
    }

    // Load the initial namespaces
    await this.refreshNamespaces()

    // When nodes are tapped or clicked, show the info panel with the resource details
    cy.on('tap', 'node', (evt) => {
      const node = evt.target
      if (node.data('resource')) {
        const newPanelData = getPanelData(node.id())
        if (!newPanelData) {
          this.panelOpen = false
          return
        }
        this.panelOpen = true
        this.panelData = newPanelData
      }
    })

    // hide the info panel when clicking outside of a node
    cy.on('tap', (evt) => {
      if (evt.target === cy) this.panelOpen = false
    })

    // Handle node removal events
    cy.on('remove', 'node', (evt) => {
      if (evt.target.id() === this.panelData.id) {
        this.$nextTick(() => {
          this.panelOpen = false
        })
      }
    })

    // Handle data updates for nodes
    cy.on('data', 'node', (evt) => {
      const node = evt.target
      if (this.panelData && node.id() === this.panelData.id) {
        this.$nextTick(() => {
          const newData = getPanelData(node.id())
          if (!newData) {
            this.panelOpen = false
            return
          }
          this.panelData = newData
        })
      }
    })

    // Handle layout stop event to show a toast if no nodes are present
    cy.on('layoutstop', () => {
      if (cy.nodes().length === 0) {
        showToast('🤷‍♂️ No resources found in this namespace<br>Check your filter settings', 3000, 'top-center')
      }
    })
  },

  // Fetch the list of namespaces from the server
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

  // Display an error message in the UI and log it to the console
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

  // Main function to fetch the namespace data
  async fetchNamespace() {
    if (this.isLoading) {
      console.warn('⚠️ Fetch already in progress, ignoring new request')
      return
    }

    this.searchQuery = ''
    this.isLoading = true
    window.history.replaceState({}, '', `?ns=${this.namespace}`)
    cy.elements().remove() // Clear the graph before loading new data

    this.isLoading = false
    this.showWelcome = false

    let data
    let res
    try {
      res = await fetch(`api/fetch/${this.namespace}?clientID=${this.clientId}`)
      if (!res.ok) throw new Error(`HTTP error ${res.status}: ${res.statusText}`)
      data = await res.json()
    } catch (err) {
      this.showError(`Failed to fetch namespace data: ${err.message}`, res)
      return
    }

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

    layout()
  },

  // Filter the viewable graph based on the search query
  search(query) {
    const q = query.trim().toLowerCase()

    if (q.length === 0) {
      // If the search query is empty, show everything
      cy.elements().style({
        display: 'element',
        visibility: 'visible',
      })
      hideToast(20)
      this.toolbarFit()
      return
    }

    // Set all nodes that match the search query to be visible
    // And hide all nodes that do not match
    const result = cy.$('node[label*="' + q + '"]')
    result.style({
      display: 'element',
      visibility: 'visible',
    })
    result.symdiff('node').style({
      display: 'none',
      visibility: 'hidden',
    })

    if (cy.$(':visible').length <= 0) {
      showToast('No resources found matching the search query', 2000, 'top-center')
    } else {
      hideToast(20)
    }

    this.toolbarFit()
  },

  // Save settings to the config
  configDialogSave() {
    saveConfig(this.cfg)
    this.showConfigDialog = false
    showToast('Configuration saved successfully', 3000, 'top-center')
    this.fetchNamespace()
  },

  toolbarCoseLayout: coseLayout,

  toolbarFit() {
    cy.resize()
    cy.fit(null, 10)
  },

  toolbarTreeLayout: layout,

  async toolbarSavePNG() {
    const blob = await cy.png({
      full: true,
      scale: 2,
      bg: '#050505',
      output: 'blob-promise',
    })

    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `kubeview-${this.namespace}.png`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  },
}))

// Initialize & start Alpine.js
Alpine.start()

/**
 * For a given resource ID, this function retrieves the data to be shown in the info panel
 * This has customized logic to present the data in a user-friendly way
 * @param {string} id - The ID of the resource to show
 * @return {PanelData | undefined} The data to be shown in the info panel, or undefined if the resource is not found
 */
function getPanelData(id) {
  // Find the resource in the resMap
  const res = resMap[id]
  if (!res) return

  const props = {
    name: res.metadata.name,
    created: res.metadata.creationTimestamp,
  }

  if (res.spec?.nodeName) props.nodeName = res.spec.nodeName
  if (res.spec?.replicas) props.replicas = res.spec.replicas
  if (res.spec?.type) props.type = res.spec.type
  if (res.spec?.clusterIP) props.clusterIP = res.spec.clusterIP
  if (res.spec?.ports) {
    props.ports = res.spec.ports
      .map((port) => {
        return `${port.name} ${port.port}${port.protocol ? `/${port.protocol}` : ''}`
      })
      .join(', ')
  }
  if (res.spec?.ipFamilies) props.ipVersions = res.spec.ipFamilies.join(', ')
  if (res.spec?.serviceAccount) props.serviceAccount = res.spec.serviceAccount
  if (res.spec?.ingressClassName) props.ingressClass = res.spec.ingressClassName
  if (res.spec?.rules) {
    props.hosts = res.spec.rules
      .map((rule) => {
        return rule.host ? rule.host : '<no host>'
      })
      .join(', ')
  }
  if (res.spec?.completions !== undefined) props.completions = res.spec.completions
  if (res.spec?.parallelism !== undefined) props.parallelism = res.spec.parallelism
  if (res.spec?.backoffLimit !== undefined) props.backoffLimit = res.spec.backoffLimit
  if (res.spec?.successfulJobsHistoryLimit !== undefined) props.successHistory = res.spec.successfulJobsHistoryLimit
  if (res.spec?.failedJobsHistoryLimit !== undefined) props.failedHistory = res.spec.failedJobsHistoryLimit
  if (res.spec?.schedule !== undefined) props.scheduled = res.spec.schedule

  if (res.status?.podIP) props.podIP = res.status.podIP
  if (res.status?.hostIP) props.hostIP = res.status.hostIP
  if (res.status?.phase) props.phase = res.status.phase
  if (res.status?.readyReplicas !== undefined) props.replicasReady = res.status.readyReplicas
  if (res.status?.availableReplicas !== undefined) props.replicasAvailable = res.status.availableReplicas
  if (res.status?.conditions) {
    for (const cond of res.status.conditions || []) {
      if (cond.type === 'Ready') {
        props.ready = cond.status === 'True' ? 'Yes' : 'No'
      }
      if (cond.type === 'PodScheduled') {
        props.scheduled = cond.status === 'True' ? 'Yes' : 'No'
      }
      if (cond.type === 'Initialized') {
        props.initialized = cond.status === 'True' ? 'Yes' : 'No'
      }
    }
  }
  if (res.status?.loadBalancer) {
    if (res.status.loadBalancer.ingress) {
      props.loadBalancer = res.status.loadBalancer.ingress.map((ingress) => ingress.ip || ingress.hostname).join(', ')
    }
  }
  // if (res.status?.active !== undefined) props.active = res.status.active
  if (res.status?.ready !== undefined) props.ready = res.status.ready
  if (res.status?.succeeded !== undefined) props.succeeded = res.status.succeeded
  if (res.status?.failed !== undefined) props.failed = res.status.failed
  if (res.status?.lastScheduleTime) props.lastScheduleTime = res.status.lastScheduleTime
  if (res.status?.lastSuccessfulTime) props.lastSuccessfulTime = res.status.lastSuccessfulTime

  // ConfigMap and Secret data
  if (res.data) {
    // just list the keys of the data object
    props.data = Object.keys(res.data).join(',\n')
  }

  // Labels
  /** @type {Record<string, string>} */
  const labels = {}
  if (res.metadata?.labels) {
    for (const [key, value] of Object.entries(res.metadata.labels)) {
      labels[key] = value
    }
  }

  /** @type {Record<string, any>} */
  const containers = {}
  if (res.status?.containerStatuses) {
    for (const c of res.status.containerStatuses) {
      containers[c.name] = {
        image: c.image,
        ready: c.ready ? 'Yes' : 'No',
        restarts: c.restartCount,
        started: c.started ? 'Yes' : 'No',
        state: Object.keys(c.state).map((key) => {
          return `${key}: ${c.state[key].reason || ''}`
        }),
      }
    }
  }

  return {
    kind: res.kind,
    id: res.metadata.uid,
    icon: res.kind.toLowerCase(),
    props,
    containers,
    labels,
  }
}
