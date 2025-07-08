//@ts-check

// ==========================================================================================
// Event streaming for Kubernetes resources
// Handles SSE events from the server and updates the graph accordingly
// These are *not* the same as Kubernetes events, which are handled in events-dialog.js
// ==========================================================================================
import { layout, removeResource, addResource, updateResource } from './graph.js'
import { getConfig } from './config.js'

let state = 'connecting' // 'connecting', 'connected', 'disconnected', 'paused'

/**
 * Get a unique client ID for this session, stored in localStorage.
 * If no ID exists, generate a new one and store it.
 * @returns {string} The client ID
 */
export function getClientId() {
  let clientID = localStorage.getItem('clientId')

  if (!clientID || clientID === 'undefined' || clientID === 'null') {
    console.warn('🆔 No client ID found, generating a new one:' + clientID)
    clientID = Math.random().toString(36).substring(2, 15)
    localStorage.setItem('clientId', clientID)
    return clientID
  }

  return clientID
}

/**
 * Set up the event streaming connection to receive live updates
 * from the server for Kubernetes resources
 */
export function initEventStreaming() {
  console.log('🌐 Opening event stream...')
  const updateStream = new EventSource(`updates?clientID=${getClientId()}`, {})
  state = 'connecting'
  notifyStateChange()

  // Handle resource add events from the server
  updateStream.addEventListener('add', async function (event) {
    if (state === 'paused') return

    /** @type {Resource} */
    let res
    try {
      res = JSON.parse(event.data)
    } catch (err) {
      console.error('💥 Error parsing event data:', err)
      return
    }

    if (getConfig().debug) console.log('⬆️ Add resource:', res.kind, res.metadata.name)

    addResource(res)
    await layout()
  })

  // Handle resource delete events from the server
  updateStream.addEventListener('delete', async function (event) {
    if (state === 'paused') return

    /** @type {Resource} */
    let res
    try {
      res = JSON.parse(event.data)
    } catch (err) {
      console.error('💥 Error parsing event data:', err)
      return
    }

    if (getConfig().debug) console.log('☠️ Delete resource:', res.kind, res.metadata.name)

    removeResource(res)
    await layout()
  })

  // Handle resource update events from the server
  updateStream.addEventListener('update', async function (event) {
    if (state === 'paused') return

    /** @type {Resource} */
    let res
    try {
      res = JSON.parse(event.data)
    } catch (err) {
      console.error('💥 Error parsing event data:', err)
      return
    }

    if (getConfig().debug) console.log('⬆️ Update resource:', res.kind, res.metadata.name)

    updateResource(res)
    await layout()
  })

  // Notify when the stream is connected
  updateStream.onopen = function () {
    console.log('✅ Event stream ready:', updateStream.readyState === 1)

    if (updateStream.readyState === 1) {
      state = 'connected'
    }

    notifyStateChange()
  }

  updateStream.onerror = function (event) {
    console.error('‼️ Event stream error:', event)
    state = 'disconnected'
    notifyStateChange()
  }
}

/**
 * Toggle the paused state of the event stream.
 */
export function togglePaused() {
  if (state === 'paused') {
    state = 'connected'
  } else if (state === 'connected') {
    state = 'paused'
  } else {
    return
  }

  notifyStateChange()
}

function notifyStateChange() {
  const stateEvent = new CustomEvent('connectionStateChange', {
    detail: { state },
  })

  window.dispatchEvent(stateEvent)
}
