//@ts-check
/// <reference path="./types/custom.d.ts" />

// ==========================================================================================
// Cache module for Kubernetes resources and events
// This module provides functions to query, save, and manage resources and events
// It maintains a map of resources and events, allowing for efficient access and updates
// ==========================================================================================

const resMap = {}

// Events are stored in a separate map just for ease of access
const eventMap = {}

/**
 * Save & cache a resource object
 * @param {Resource} res The resource object to save
 */
export function store(res) {
  const id = res.metadata.uid

  // If it's an event, store it in the event map
  if (res.kind === 'Event') {
    eventMap[id] = res
    return
  }

  // Store the resource in the resource map
  resMap[id] = res
}

/**
 * Remove a resource or event from the cache by its ID
 * @param {string} id The unique identifier of the resource or event to remove
 */
export function remove(id) {
  if (resMap[id]) {
    delete resMap[id]
  }
  if (eventMap[id]) {
    delete eventMap[id]
  }
}

/**
 * Query the resource map with a filter function
 * @param {any} filterFn A function that takes a Resource and returns true if it should be included
 * @returns {any[]} An array of resources that match the filter function
 */
export function queryRes(filterFn) {
  return Object.values(resMap).filter(filterFn)
}

/**
 * Query the resource map for a specific resource by kind and name
 * @param {string} kind
 * @param {string} name
 * @returns {Resource | null} The first resource that matches the kind and name, or null if not found
 */
export function findResByName(kind, name) {
  return Object.values(resMap).find((res) => res.kind === kind && res.metadata.name === name)
}

/**
 * Get a cached resource by its ID
 * @param {string} id
 * @returns {Resource | null} The resource object or null if not found
 */
export function getResById(id) {
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
      return Date.parse(getTimestamp(b)) - Date.parse(getTimestamp(a)) // Sort by event time, newest first
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
 * Get the timestamp of an event resource
 * @param {EventResource} event The event resource
 * @returns {string} The event timestamp, either from eventTime or lastTimestamp
 */
export function getTimestamp(event) {
  // Use eventTime if available, otherwise fall back to lastTimestamp
  return event.eventTime || event.lastTimestamp || event.metadata.creationTimestamp || ''
}
