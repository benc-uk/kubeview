//@ts-check
/// <reference path="./types/custom.d.ts" />

// ==========================================================================================
// Handles most graph operations like adding, updating, and removing resources
// Also stores some cached resources and events not related to the graph
// Also processes links between resources in the Cytoscape graph
// ==========================================================================================

import { getConfig } from './config.js'
import { graph } from './main.js'

const ICON_PATH = 'public/img/res'

// A map & cache of resources by their UID, used in a bunch of places
const resMap = {}
const eventMap = {}

/**
 * Query the resource map with a filter function
 * @param {any} filterFn A function that takes a Resource and returns true if it should be included
 * @returns {any[]} An array of resources that match the filter function
 */
function queryRes(filterFn) {
  return Object.values(resMap).filter(filterFn)
}

/**
 * Get a cached resource by its ID
 * @param {string} id
 * @returns {Resource | null} The resource object or null if not found
 */
export function getResource(id) {
  return resMap[id] || null
}

/**
 * Get events from the cache
 * @param {number} [count=100] The maximum number of events to return, defaults to 100
 * @return {Resource[]} An array of all events in the event map
 */
export function getEvents(count = 100) {
  const sortedEvents = Object.values(eventMap)
    .sort((a, b) => {
      return Date.parse(b.lastTimestamp) - Date.parse(a.lastTimestamp)
    })
    .slice(0, count)

  return sortedEvents
}

/**
 * Clear the resource and event cache
 * This is used to reset the graph state, e.g. when switching namespaces
 * @returns {void}
 */
export function clearCache() {
  Object.keys(resMap).forEach((key) => delete resMap[key])
  Object.keys(eventMap).forEach((key) => delete eventMap[key])
}

/**
 * Used to add a resource to the graph
 * @param {Resource} res The k8s resource to add
 */
export function addResource(res) {
  // Endpoints are stored in the resmap but not added to the graph
  if (res.kind === 'Endpoints' || res.kind === 'EndpointSlice') {
    resMap[res.metadata.uid] = res
    processLinks(res)
    return
  }

  // Events are special, they are not added to the graph
  if (res.kind === 'Event') {
    eventMap[res.metadata.uid] = res

    // Notify the events dialog that a new event has been added
    window.dispatchEvent(new CustomEvent('kubeEventAdded', { detail: res }))
  }

  // Hide resources that are not in the filter
  if (getConfig().resFilter && !getConfig().resFilter.includes(res.kind)) {
    if (getConfig().debug) console.warn(`🍇 Skipping resource of kind ${res.kind} as it is not in the filter`)
    return
  }

  try {
    graph.addNodeData([makeNode(res)])
    processLinks(res)

    resMap[res.metadata.uid] = res
    return res.metadata.uid
  } catch (e) {
    if (getConfig().debug) {
      console.warn(`🍒 Unable to add node for resource ${res.metadata.name} (${res.kind}):`, e.message)
    }
  }
}

/**
 * Used to update a resource in the graph
 * It will update the node data and the status colour
 * @param {Resource} res The k8s resource to update
 */
export async function updateResource(res) {
  // Endpoints are stored in the resmap but not added to the graph
  if (res.kind === 'Endpoints') {
    resMap[res.metadata.uid] = res
    processLinks(res)
    return
  }
  // Events are special, they are not added to the graph
  if (res.kind === 'Event') {
    eventMap[res.metadata.uid] = res
    window.dispatchEvent(new CustomEvent('eventsUpdated', { detail: res }))
    return
  }

  try {
    const node = graph.getNodeData(res.metadata.uid)
    if (node.length === 0) {
      // If the node does not exist, we add it
      if (getConfig().debug) console.warn(`🍒 Node with ID ${res.metadata.uid} not found, adding it`)
      addResource(res)
      processLinks(res)
      return
    }
  } catch (_err) {}

  // Actual update is here
  try {
    graph.updateNodeData([makeNode(res)])
  } catch (_err) {}

  resMap[res.metadata.uid] = res
  processLinks(res)

  // Dispatch a custom event to notify that the node has been updated
  const event = new CustomEvent('nodeUpdated', { detail: res.metadata.uid })
  window.dispatchEvent(event)
}

/**
 * Used remove a resource from the graph
 * @param {Resource} res The k8s resource to remove
 */
export function removeResource(res) {
  // Function to remove edges linked to this resource
  graph.removeEdgeData((nodeDataList) => {
    const b = nodeDataList
      .filter((edge) => {
        return edge.source === res.metadata.uid || edge.target === res.metadata.uid
      })
      .map((edge) => {
        return edge.id
      })
    return b
  })

  try {
    graph.removeNodeData([res.metadata.uid])
  } catch (_err) {}

  delete resMap[res.metadata.uid]

  // Dispatch a custom event to notify that the node has been deleted
  const event = new CustomEvent('nodeDeleted', { detail: res.metadata.uid })
  window.dispatchEvent(event)
}

/**
 * Link two nodes together
 * @param {string} sourceId The ID of the source node
 * @param {string} targetId The ID of the target node
 */
export function addEdge(sourceId, targetId) {
  try {
    // Check the source and target IDs are valid
    if (graph.getNodeData(sourceId).length === 0 || graph.getNodeData(targetId).length === 0) {
      if (getConfig().debug) {
        console.warn(`🚸 Unable to add link: ${sourceId} to ${targetId}`)
      }
      return
    }

    graph.addEdgeData([
      {
        source: sourceId,
        target: targetId,
        id: `${sourceId}.${targetId}`,
      },
    ])
  } catch (_err) {
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
            const services = queryRes((r) => r.kind === 'Service' && r.metadata.name === serviceName)
            if (services.length > 0) {
              addEdge(res.metadata.uid, services[0].metadata.uid)
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
          const pods = queryRes((r) => r.kind === 'Pod' && r.status?.podIP === addr.ip)
          if (pods.length > 0) {
            const podName = pods[0].metadata?.name || 'Unknown Pod'
            if (getConfig().debug) console.log(`🔗 Linking Service ${res.metadata.name} to PodIP ${addr.ip} (${podName})`)
            addEdge(res.metadata.uid, pods[0].metadata?.uid)
          }
        }
      }
    }
  }

  // // If the resource is a endpoint, we find matching service and link it to the pods
  // if (res.kind === 'Endpoints') {
  //   const service = cy.$(`node[kind = "Service"][label = "${res.metadata.name}"]`)
  //   if (service.length == 1) {
  //     // find the pods in the endpoints and link them to the service
  //     for (const subset of res.subsets || []) {
  //       for (const addr of subset.addresses || []) {
  //         const pod = cy.$(`node[kind = "Pod"][ip = "${addr.ip}"]`)
  //         if (pod.length > 0) {
  //           if (getConfig().debug) console.log(`🔗 Linking Endpoints ${res.metadata.name} to PodIP ${addr.ip} (${pod.data('label')})`)
  //           addEdge(service.id(), pod.id())
  //         }
  //       }
  //     }
  //   }
  // }
  // // Handle endpoint slices, these replace Endpoints in newer Kubernetes versions
  // // If the server version is 1.33 or higher, we will use EndpointSlices instead of Endpoints
  // // See https://kubernetes.io/blog/2025/04/24/endpoints-deprecation/
  // if (res.kind === 'EndpointSlice') {
  //   const serviceName = res.metadata?.labels?.['kubernetes.io/service-name']
  //   const service = cy.$(`node[kind = "Service"][label = "${serviceName}"]`)
  //   if (service.length == 1) {
  //     for (const ep of res.endpoints || []) {
  //       if (ep.addresses && ep.addresses.length > 0) {
  //         const addr = ep.addresses[0]
  //         const pod = cy.$(`node[kind = "Pod"][ip = "${addr}"]`)
  //         if (pod.length > 0) {
  //           if (getConfig().debug) console.log(`🔗 Linking EndpointSlice ${res.metadata.name} to PodIP ${addr} (${pod.data('label')})`)
  //           addEdge(service.id(), pod.id())
  //         } else {
  //           if (getConfig().debug) console.warn(`🔗 No Pod found for EndpointSlice ${res.metadata.name} with IP ${addr}`)
  //         }
  //       }
  //     }
  //   }
  // }
  // Try to link a pod with a volume claim to the PVC resource
  if (res.kind === 'Pod' && res.spec?.volumes) {
    for (const volume of res.spec.volumes) {
      if (volume.persistentVolumeClaim && volume.persistentVolumeClaim.claimName) {
        const pvcs = queryRes((r) => r.kind === 'PersistentVolumeClaim' && r.metadata.name === volume.persistentVolumeClaim.claimName)
        if (pvcs.length > 0) {
          if (getConfig().debug) console.log(`🔗 Linking Pod ${res.metadata.name} to PVC ${volume.persistentVolumeClaim.claimName}`)
          addEdge(res.metadata.uid, pvcs[0].metadata.uid)
        }
      }
    }
  }
  // // Try to link config maps and secrets to pods
  // if (res.kind === 'Pod' && res.spec?.volumes) {
  //   for (const volume of res.spec.volumes) {
  //     if (volume.configMap && volume.configMap.name) {
  //       const cm = cy.$(`node[kind = "ConfigMap"][label = "${volume.configMap.name}"]`)
  //       if (cm.length > 0) {
  //         if (getConfig().debug) console.log(`🔗 Linking Pod ${res.metadata.name} to ConfigMap ${volume.configMap.name}`)
  //         addEdge(res.metadata.uid, cm.id())
  //       }
  //     }
  //     if (volume.secret && volume.secret.secretName) {
  //       const secret = cy.$(`node[kind = "Secret"][label = "${volume.secret.secretName}"]`)
  //       if (secret.length > 0) {
  //         if (getConfig().debug) console.log(`🔗 Linking Pod ${res.metadata.name} to Secret ${volume.secret.secretName}`)
  //         addEdge(res.metadata.uid, secret.id())
  //       }
  //     }
  //   }
  // }
  // // Try to link a HPA to the target resource
  // if (res.kind === 'HorizontalPodAutoscaler' && res.spec?.scaleTargetRef) {
  //   const targetKind = res.spec.scaleTargetRef.kind
  //   const targetName = res.spec.scaleTargetRef.name
  //   // Find the target resource in the graph
  //   const targetNode = cy.$(`node[kind = "${targetKind}"][label = "${targetName}"]`)
  //   if (targetNode.length > 0) {
  //     if (getConfig().debug) console.log(`🔗 Linking HPA ${res.metadata.name} to ${targetKind} ${targetName}`)
  //     addEdge(res.metadata.uid, targetNode.id())
  //   } else {
  //     if (getConfig().debug) console.warn(`🔗 No target resource found for HPA ${res.metadata.name}`)
  //   }
  // }
}

/**
 * Create a node object for G6 from the k8s resource
 * @param {Resource} res The k8s resource to create a node for
 * @returns {ResNode} The G6 node object to be added to the graph
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
    id: res.metadata.uid,
    style: {
      src: `${ICON_PATH}/${res.kind.toLowerCase() + colourSuffix}.svg`,
      labelText: label,
    },
    data: {
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
let layoutCallBackId = null
export async function layout() {
  try {
    await graph.draw()
    await graph.fitView()

    if (layoutCallBackId) {
      clearTimeout(layoutCallBackId)
    }

    layoutCallBackId = setTimeout(async () => {
      graph.stopLayout()
      try {
        console.log('🔄 Running graph layout...')

        await graph.layout()
        await graph.fitView()
      } catch (_err) {
        console.error('💥 Error during graph layout:', _err)
      }
    }, 80)
  } catch (_err) {}
}

export async function tempShit() {}
