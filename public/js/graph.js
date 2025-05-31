//@ts-check

// ==========================================================================================
// Handles most graph operations like adding, updating, and removing resources
// Also processes links between resources in the Cytoscape graph
// ==========================================================================================

import { getConfig } from './config.js'
import { cy, resMap } from './main.js'

const ICON_PATH = 'public/img/res'

/**
 * Used to add a resource to the graph
 * @param {Resource} res The k8s resource to add
 */
export function addResource(res) {
  // Endpoints are stored in the resmap but not added to the graph
  if (res.kind === 'Endpoints') {
    resMap[res.metadata.uid] = res
    processLinks(res)
    return
  }

  // Hide resources that are not in the filter
  if (getConfig().resFilter && !getConfig().resFilter.includes(res.kind)) {
    if (getConfig().debug) console.warn(`🍇 Skipping resource of kind ${res.kind} as it is not in the filter`)
    return
  }

  cy.add(makeNode(res))
  processLinks(res)

  resMap[res.metadata.uid] = res
  return res.metadata.uid
}

/**
 * Used to update a resource in the graph
 * It will update the node data and the status colour
 * @param {Resource} res The k8s resource to update
 */
export function updateResource(res) {
  // Endpoints are stored in the resmap but not added to the graph
  if (res.kind === 'Endpoints') {
    resMap[res.metadata.uid] = res
    processLinks(res)
    return
  }

  const node = cy.getElementById(res.metadata.uid)
  if (node.length === 0) {
    // If the node does not exist, we add it
    if (getConfig().debug) {
      console.warn(`🍒 Node with ID ${res.metadata.uid} not found, adding it`)
    }

    addResource(res)
    processLinks(res)

    return
  }

  // Actual update is here
  node.data(makeNode(res).data)
  resMap[res.metadata.uid] = res
  processLinks(res)
}

/**
 * Used remove a resource from the graph
 * @param {Resource} res The k8s resource to remove
 */
export function removeResource(res) {
  cy.remove('#' + res.metadata.uid)
  delete resMap[res.metadata.uid]
}

/**
 * Link two nodes together
 * @param {string} sourceId The ID of the source node
 * @param {string} targetId The ID of the target node
 */
export function addEdge(sourceId, targetId) {
  try {
    // This is the syntax Cytoscape uses for creating edges
    // We form a compound ID from the source and target IDs
    cy.add({
      data: {
        id: `${sourceId}.${targetId}`,
        source: sourceId,
        target: targetId,
      },
    })
    // eslint-disable-next-line
  } catch (e) {
    if (getConfig().debug) {
      console.warn(`🚸 Unable to add link: ${sourceId} to ${targetId}`)
    }
  }
}

/**
 * Lots of nasty custom logic to link resources together
 * This is used to link Ingresses to Services and Services to Pods, etc.
 * @param {Resource} res The resource to process links for
 */
export function processLinks(res) {
  if (res.metadata.ownerReferences) {
    for (const ownerRef of res.metadata.ownerReferences) {
      addEdge(ownerRef.uid, res.metadata.uid)
    }
  }

  // If the resource is a Ingress, we link it to the Service via the backend service name
  if (res.kind === 'Ingress' && res.spec?.rules) {
    for (const rule of res.spec.rules) {
      if (rule.http && rule.http.paths) {
        for (const path of rule.http.paths) {
          if (path.backend && path.backend.service && path.backend.service.name) {
            if (getConfig().debug) console.log(`🔗 Linking Ingress ${res.metadata.name} to Service ${path.backend.service.name}`)

            const serviceName = path.backend.service.name
            const service = cy.$(`node[kind = "Service"][label = "${serviceName}"]`)
            if (service.length > 0) {
              addEdge(res.metadata.uid, service.id())
            }
          }
        }
      }
    }
  }

  // If the resource is a Service, we link it to the Pods using endpoint subnet and podID
  if (res.kind === 'Service') {
    const ep = Object.values(resMap).find((r) => r.kind === 'Endpoints' && r.metadata.name === res.metadata.name)
    if (ep) {
      for (const subset of ep.subsets || []) {
        for (const addr of subset.addresses || []) {
          const pod = cy.$(`node[kind = "Pod"][ip = "${addr.ip}"]`)
          if (pod.length > 0) {
            if (getConfig().debug) console.log(`🔗 Linking Service ${res.metadata.name} to PodIP ${addr.ip} (${pod.data('label')})`)
            addEdge(res.metadata.uid, pod.id())
          }
        }
      }
    }
  }

  // If the resource is a endpoint, we find matching service and link it to the pods
  if (res.kind === 'Endpoints') {
    const service = cy.$(`node[kind = "Service"][label = "${res.metadata.name}"]`)
    if (service.length == 1) {
      // find the pods in the endpoints and link them to the service
      for (const subset of res.subsets || []) {
        for (const addr of subset.addresses || []) {
          const pod = cy.$(`node[kind = "Pod"][ip = "${addr.ip}"]`)
          if (pod.length > 0) {
            if (getConfig().debug) console.log(`🔗 Linking Endpoints ${res.metadata.name} to PodIP ${addr.ip} (${pod.data('label')})`)
            addEdge(service.id(), pod.id())
          }
        }
      }
    }
  }

  // Try to link a pod with a volume claim to the PVC
  if (res.kind === 'Pod' && res.spec?.volumes) {
    for (const volume of res.spec.volumes) {
      if (volume.persistentVolumeClaim && volume.persistentVolumeClaim.claimName) {
        const pvc = cy.$(`node[kind = "PersistentVolumeClaim"][label = "${volume.persistentVolumeClaim.claimName}"]`)
        if (pvc.length > 0) {
          if (getConfig().debug) console.log(`🔗 Linking Pod ${res.metadata.name} to PVC ${volume.persistentVolumeClaim.claimName}`)
          addEdge(res.metadata.uid, pvc.id())
        }
      }
    }
  }
}

/**
 * Create a node object for Cytoscape from the k8s resource
 * @param {Resource} res The k8s resource to create a node for
 * @returns {ResNode} The cytoscape node object to be added to the graph
 */
function makeNode(res) {
  let label = res.metadata.name

  // Shorten the name if configured to do so
  if (getConfig().shortenNames && res.metadata && res.metadata.labels) {
    if (res.metadata.labels['pod-template-hash']) {
      label = label.split('-' + res.metadata.labels['pod-template-hash'])[0]
    }
  }

  let colourSuffix = statusColour(res)
  if (colourSuffix !== '') {
    colourSuffix = '-' + colourSuffix
  }

  return {
    data: {
      resource: true,
      id: res.metadata.uid,
      label: label,
      icon: `${ICON_PATH}/${res.kind.toLowerCase() + colourSuffix}.svg`,
      kind: res.kind,
      ip: res.status?.podIP || res.status?.hostIP || null,
    },
  }
}

/**
 * Used to calculate the status colour of the resource based on its state
 * @param {Resource} res The k8s resource to calculate the status colour for
 */
function statusColour(res) {
  try {
    if (res.kind === 'Deployment') {
      if (res.status == {} || !res.status.conditions) return 'grey'

      const availCond = res.status.conditions.find((c) => c.type == 'Available') || null
      if (availCond && availCond.status == 'True') return 'green'
      return 'red'
    }

    if (res.kind === 'ReplicaSet') {
      if (res.status.replicas == 0) return 'grey'
      if (res.status.replicas == res.status.readyReplicas) return 'green'
      return 'red'
    }

    if (res.kind === 'StatefulSet') {
      if (res.status.replicas == 0) return 'grey'
      if (res.status.replicas == res.status.readyReplicas) return 'green'
      return 'red'
    }

    if (res.kind === 'DaemonSet') {
      if (res.status.numberReady == res.status.desiredNumberScheduled) return 'green'
      if (res.status.desiredNumberScheduled == 0) return 'grey'
      return 'red'
    }

    if (res.kind === 'Pod') {
      // Weird way to check for terminaing pods, it's not anywhere else!
      if (res.metadata.deletionTimestamp) return 'red'

      if (res.status && res.status.conditions) {
        const readyCond = res.status.conditions.find((c) => c.type == 'Ready')
        if (readyCond && readyCond.status == 'True') return 'green'
      }

      if (res.status.phase == 'Failed') return 'red'
      if (res.status.phase == 'Succeeded') return 'green'
      if (res.status.phase == 'Pending') return 'grey'

      return 'grey'
    }

    if (res.kind === 'PersistentVolumeClaim') {
      if (res.status.phase === 'Bound') return 'green'
      if (res.status.phase === 'Pending') return 'grey'
      return 'red'
    }

    if (res.kind === 'Job') {
      const backoffLimit = res.spec.backoffLimit || 6
      const succeeded = res.status?.succeeded || 0
      const completions = res.spec?.completions || 1 // Default to 1 if not set
      const failed = res.status?.failed || 0

      if (succeeded >= completions) return 'green'
      if (failed >= backoffLimit) return 'red'

      return 'grey'
    }
  } catch (e) {
    console.error('💥 Error calculating status colour:', e)
    return ''
  }

  return ''
}

/**
 * Layout the graph
 */
export function layout() {
  // Use breadthfirst with roots set to the main resources
  // This will create a tree-like structure with the main resources at the top
  cy.resize()
  cy.fit(null, 10)

  cy.layout({
    name: 'breadthfirst',
    directed: true,
    roots: cy.nodes('[kind = "Ingress"],[kind = "Deployment"],[kind = "DaemonSet"],[kind = "StatefulSet"],[kind = "Job"]'),
    nodeDimensionsIncludeLabels: true,
    spacingFactor: 1,
  }).run()
}

export function coseLayout() {
  cy.layout({
    name: 'cose',
    randomize: false,
    numIter: 5000,
    nodeDimensionsIncludeLabels: true,
  }).run()
}
