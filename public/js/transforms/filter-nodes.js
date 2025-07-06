//@ts-check
/// <reference path="../types/custom.d.ts" />

// ==========================================================================================
// Node filtering utility for G6 graph
// This module provides functions to filter/hide nodes based on search queries
// ==========================================================================================

// Store all nodes and edges for filtering operations
let allNodesCache = []
let allEdgesCache = []
let currentFilterQuery = ''

/**
 * Caches all current nodes and edges in the graph
 * This should be called whenever new nodes are added to ensure filtering works correctly
 * @param {Object} graph - The G6 graph instance
 */
export function cacheGraphData(graph) {
  if (!graph) {
    return
  }

  try {
    allNodesCache = graph.getNodeData()
    allEdgesCache = graph.getEdgeData()
    console.log(`📦 Cached ${allNodesCache.length} nodes and ${allEdgesCache.length} edge`)
  } catch (error) {
    console.error('💥 Error caching graph data:', error)
    allNodesCache = []
    allEdgesCache = []
  }
}

/**
 * Filters nodes in the graph based on a search query
 * @param {Object} graph - The G6 graph instance
 * @param {string} query - The search query string
 * @param {Object} options - Optional configuration
 * @param {boolean} [options.caseSensitive] - Whether search should be case sensitive
 * @returns {number} Number of visible nodes after filtering
 */
export function filterNodes(graph, query, options = {}) {
  const { caseSensitive = false } = options

  if (!graph) {
    console.warn('⚠️ Graph instance not provided to filterNodes')
    return 0
  }

  // Cache current data if not already cached
  if (allNodesCache.length === 0) {
    cacheGraphData(graph)
  }

  currentFilterQuery = query

  // If no query, show all nodes
  if (!query || query.trim().length === 0) {
    try {
      graph.setData({
        nodes: allNodesCache,
        edges: allEdgesCache,
      })
      graph.render()
      return allNodesCache.length
    } catch (error) {
      console.error('💥 Error showing all nodes:', error)
      return 0
    }
  }

  const searchQuery = caseSensitive ? query.trim() : query.trim().toLowerCase()

  // Filter nodes based on label match
  const filteredNodes = allNodesCache.filter((node) => {
    const label = node.style?.labelText || ''
    const searchLabel = caseSensitive ? label : label.toLowerCase()
    return searchLabel.includes(searchQuery)
  })

  // Get IDs of filtered nodes for edge filtering
  const filteredNodeIds = new Set(filteredNodes.map((node) => node.id))

  // Filter edges to only include those connecting visible nodes
  const filteredEdges = allEdgesCache.filter((edge) => filteredNodeIds.has(edge.source) && filteredNodeIds.has(edge.target))

  try {
    // Update graph with filtered data
    graph.setData({
      nodes: filteredNodes,
      edges: filteredEdges,
    })
    graph.render()

    return filteredNodes.length
  } catch (error) {
    console.error('💥 Error applying filter:', error)
    return 0
  }
}

/**
 * Shows all nodes in the graph (clears any filtering)
 * @param {Object} graph - The G6 graph instance
 * @returns {number} Total number of nodes
 */
export function showAllNodes(graph) {
  if (!graph) {
    console.warn('⚠️ Graph instance not provided to showAllNodes')
    return 0
  }

  currentFilterQuery = ''

  // Cache current data if not already cached
  if (allNodesCache.length === 0) {
    cacheGraphData(graph)
  }

  try {
    graph.setData({
      nodes: allNodesCache,
      edges: allEdgesCache,
    })
    graph.render()
    return allNodesCache.length
  } catch (error) {
    console.error('💥 Error showing all nodes:', error)
    return 0
  }
}

/**
 * Gets the count of currently visible nodes
 * @param {Object} graph - The G6 graph instance
 * @returns {number} Number of visible nodes
 */
export function getVisibleNodeCount(graph) {
  if (!graph) {
    return 0
  }

  try {
    return graph.getNodeData().length
  } catch (error) {
    console.error('💥 Error getting visible node count:', error)
    return 0
  }
}

/**
 * Gets the current filter query
 * @returns {string} The current filter query
 */
export function getCurrentFilterQuery() {
  return currentFilterQuery
}

/**
 * Refreshes the cache with current graph data
 * This should be called after any major graph changes
 * @param {Object} graph - The G6 graph instance
 */
export function refreshCache(graph) {
  cacheGraphData(graph)
}

/**
 * Clears the node cache - should be called when the graph is completely reloaded
 */
export function clearCache() {
  allNodesCache = []
  allEdgesCache = []
  currentFilterQuery = ''
  console.log('🧹 Filter cache cleared')
}
