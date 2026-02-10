//@ts-check
/// <reference path="./types/custom.d.ts" />

import { showToast } from '../ext/toast.js'
import { getEvents, getTimestamp } from './cache.js'

// ==========================================================================================
// Events dialog component for displaying Kubernetes events
// Note this is very different from the SSE events handled by events.js
// ==========================================================================================

export default () => ({
  /** @type {Resource[]} */
  events: [],

  init() {
    this.$watch('showEventsDialog', (showEventsDialog) => {
      if (showEventsDialog) {
        this.updateEvents()
      }
    })

    // Listen for events as they are added to the cache
    window.addEventListener('kubeEventAdded', () => {
      // Fetch *all* the events again, because we don't know which one was added
      // We'd have to iterate through the events to put the new one in the right place anyhow
      if (this.showEventsDialog) {
        this.updateEvents()
      }
    })
  },

  // Update the list of events in our UI state, from the cache
  updateEvents() {
    // Note this fetches ALL the events, but we're only talking about ~100 events at a time
    // And we're just copying the data from one array to another
    this.events = getEvents()

    if (this.events.length === 0) {
      this.$nextTick(() => {
        showToast('No events found in namespace', 3000, 'top-center', 'warning')
      })

      this.showEventsDialog = false
    }
  },

  // Warning events are red, Normal events are green
  // See https://kubernetes.io/docs/reference/kubernetes-api/cluster-resources/event-v1/
  textColour(event) {
    if (event.type === 'Warning') return 'has-text-danger'

    return 'has-text-success'
  },

  // Format the event message for display
  niceDate(event) {
    const date = new Date(getTimestamp(event))
    return date.toLocaleString()
  },
})
