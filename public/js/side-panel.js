//@ts-check
/// <reference path="./types/custom.d.ts" />

import { NodeEvent, CanvasEvent, GraphEvent } from '../ext/g6-esm.js'
import { graph } from './main.js'
import { getResById } from './cache.js'

// ==========================================================================================
// Component for the side panel showing information about a resource
// Also responsible for showing pod logs
// Responds to clicks in the graph & other events
// ==========================================================================================

export default () => ({
  open: false,
  showLabels: false,
  showAnno: false,
  showProps: true,
  showContainers: true,
  isPod: false,

  /** @type {PanelData} */
  panelData: {
    id: '',
    kind: 'default',
    icon: 'default',
    props: {},
    containers: {},
    labels: {},
    annotations: {},
  },

  init() {
    // When nodes are tapped or clicked, show the side panel with the resource details
    graph.on(NodeEvent.CLICK, (evt) => {
      const { target: node } = evt
      const res = getResById(node.id)
      if (!res) return
      this.updateData(res)
      this.open = true
    })

    // Hide the side panel when clicking outside of a node
    graph.on(CanvasEvent.CLICK, (_evt) => {
      this.open = false
    })

    graph.on(GraphEvent.AFTER_ELEMENT_DESTROY, (evt) => {
      if (evt.elementType === 'node') {
        const nodeId = evt.data.id
        if (this.panelData && this.panelData.id === nodeId) {
          this.$nextTick(() => {
            this.open = false
          })
        }
      }
    })

    graph.on(GraphEvent.AFTER_ELEMENT_UPDATE, (evt) => {
      if (evt.elementType === 'node') {
        const nodeId = evt.data.id
        if (this.panelData && this.panelData.id === nodeId) {
          this.$nextTick(() => {
            const res = getResById(nodeId)
            if (res) this.updateData(res)
          })
        }
      }
    })

    window.addEventListener('closePanel', () => {
      this.$nextTick(() => {
        this.open = false
      })
    })
  },

  /**
   * Convert a Kubernetes resource to a format suitable for showing in the side panel
   * Lots of custom logic to make the panel look nice and show relevant information
   * @param {Resource} res
   */
  updateData(res) {
    // Common properties for all resources
    const props = {
      name: res.metadata.name,
      created: res.metadata.creationTimestamp,
    }

    this.isPod = false
    if (res.kind === 'Pod') {
      this.isPod = true
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
    if (res.spec?.storageClassName) props.storageClass = res.spec.storageClassName
    if (res.spec?.volumeMode) props.volumeMode = res.spec.volumeMode
    if (res.spec?.minReplicas !== undefined) props.minReplicas = res.spec.minReplicas
    if (res.spec?.maxReplicas !== undefined) props.maxReplicas = res.spec.maxReplicas
    if (res.spec?.scaleTargetRef) {
      props.scaleTarget = `${res.spec.scaleTargetRef.kind}: ${res.spec.scaleTargetRef.name}`
    }
    // For HPA: kinda convoluted as the spec is a bit fiddly
    for (const [index, metric] of (res.spec?.metrics || []).entries()) {
      const typeLower = metric.type.toLowerCase()
      if (metric[typeLower]) {
        const target = metric[typeLower].target
        const value = target.averageUtilization || target.averageValue || target.value
        const name = metric[typeLower].name || metric[typeLower].metric?.name
        props[`metric${index + 1}`] = `${metric.type}: ${name} -> ${value}`
      }
    }

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
    if (res.status?.capacity) {
      props.capacity = Object.entries(res.status.capacity)
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ')
    }
    if (res.status?.phase) props.phase = res.status.phase
    if (res.status?.accessModes) {
      props.accessModes = res.status.accessModes.join(', ')
    }

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

    // Annotations
    /** @type {Record<string, string>} */
    const annotations = {}
    if (res.metadata?.annotations) {
      for (const [key, value] of Object.entries(res.metadata.annotations)) {
        annotations[key] = value
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
            const reason = c.state[key]
            if (typeof reason === 'string') {
              return `${key}: ${reason}`
            }
            return key
          }),
        }
      }
    }

    this.panelData = {
      kind: res.kind,
      id: res.metadata.uid,
      icon: res.kind.toLowerCase(),
      props,
      containers,
      labels,
      annotations,
    }
  },

  async showLogs(podName) {
    console.log(`📜 Fetching logs for pod ${podName} in namespace ${this.namespace}`)
    this.isLoading = true

    // Note these properties are in the parent mainApp component
    // It didn't work having them here, so we use the parent component's properties
    this.showLogsDialog = true
    this.logs = ''

    // Fetch logs from the server, the last 300 lines
    let res
    try {
      res = await fetch(`api/logs/${this.namespace}/${podName}?max=300`)
      if (!res.ok) throw new Error(`HTTP error ${res.status}: ${res.statusText}`)

      this.isLoading = false
      this.logs = (await res.text()) || 'No logs available'

      // Scroll to the bottom of the log area
      this.$nextTick(() => {
        const logArea = document.getElementById('logArea')
        if (logArea) logArea.scrollTop = logArea.scrollHeight
      })
    } catch (err) {
      this.showError(`Failed to fetch logs: ${err.message}`, res)
      this.open = false
      return
    }
  },
})
