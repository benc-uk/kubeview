//@ts-check

// ==========================================================================================
// Event streaming for Kubernetes resources
// Handles SSE events from the server and updates the graph accordingly
// ==========================================================================================
import { layout, removeResource, addResource, updateResource } from './graph.js'
import { getConfig } from './config.js'

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

let disconnected = false

export function initEventStreaming() {
  const clientId = getClientId()

  console.log('🌐 Opening event stream...')
  const updateStream = new EventSource(`updates?clientID=${clientId}`, {})
  disconnected = false

  // Handle resource add events from the server
  updateStream.addEventListener('add', function (event) {
    /** @type {Resource} */
    let res
    try {
      res = JSON.parse(event.data)
    } catch (e) {
      console.error('💥 Error parsing event data:', e)
      return
    }

    if (getConfig().debug) console.log('⬆️ Add resource:', res.kind, res.metadata.name)

    addResource(res)
    layout()

    // Inform main app that a new resource has been added
    window.dispatchEvent(new CustomEvent('resAdded', {}))
  })

  // Handle resource delete events from the server
  updateStream.addEventListener('delete', function (event) {
    /** @type {Resource} */
    let res
    try {
      res = JSON.parse(event.data)
    } catch (e) {
      console.error('💥 Error parsing event data:', e)
      return
    }

    if (getConfig().debug) console.log('☠️ Delete resource:', res.kind, res.metadata.name)

    removeResource(res)
    layout()
  })

  // Handle resource update events from the server
  updateStream.addEventListener('update', function (event) {
    /** @type {Resource} */
    let res
    try {
      res = JSON.parse(event.data)
    } catch (e) {
      console.error('💥 Error parsing event data:', e)
      return
    }

    if (getConfig().debug) console.log('⬆️ Update resource:', res.kind, res.metadata.name)

    updateResource(res)
  })

  // Notify when the stream is connected
  updateStream.onopen = function () {
    console.log('✅ Event stream ready:', updateStream.readyState === 1)
    const statusIcon = document.getElementById('eventStatusIcon')

    if (updateStream.readyState === 1 && statusIcon) {
      statusIcon.classList.remove('is-danger', 'is-warning')
      statusIcon.classList.add('is-success')
      if (disconnected) {
        disconnected = false
        console.log('▶️ Reconnected to event stream')
        // Inform main app that the stream has reconnected
        window.dispatchEvent(new CustomEvent('reconnect', {}))
      }
    } else if (statusIcon) {
      statusIcon.classList.remove('is-success')
      statusIcon.classList.add('is-warning')
    }
  }

  updateStream.onerror = function (event) {
    console.error('‼️ Event stream error:', event)
    if (!disconnected) {
      // Inform main app that the stream has disconnected
      window.dispatchEvent(new CustomEvent('disconnect', {}))
    }
    disconnected = true

    const statusIcon = document.getElementById('eventStatusIcon')

    if (statusIcon) {
      statusIcon.classList.remove('is-success')
      statusIcon.classList.add('is-danger')
    }
  }
}
