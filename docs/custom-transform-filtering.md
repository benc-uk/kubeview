# Custom G6 Transform: Node Filtering

This document describes the custom transform implementation for filtering nodes in the G6 graph based on search queries.

## Overview

The custom transform allows users to filter and hide nodes in the Kubernetes resource graph based on search strings. When a search query is entered, only nodes whose labels contain the search string will be visible, and all others will be hidden.

## Implementation Details

### Architecture

The filtering system is implemented using a custom utility module rather than a traditional G6 transform, as this approach provides better control over node visibility and performance.

**Files:**

- `/public/js/transforms/filter-nodes.js` - Main filtering logic
- `/public/js/main.js` - Integration with the main application

### Key Components

1. **Cache Management**: The system maintains a cache of all nodes and edges to enable efficient filtering without losing data.

2. **Search Functions**:

   - `filterNodes(graph, query, options)` - Filters nodes based on search query
   - `showAllNodes(graph)` - Shows all nodes (clears filter)
   - `cacheGraphData(graph)` - Caches current graph data
   - `clearCache()` - Clears the cache when graph is reloaded

3. **Integration Points**:
   - Search input in the UI triggers `filterView()` function
   - Graph data is cached after initial load and after node updates
   - Filter cache is cleared when namespace is changed

### How It Works

1. **Initial Load**: When a namespace is loaded, all nodes and edges are cached
2. **Search Input**: User types in search box, triggering `filterView()`
3. **Filtering**: The system:
   - Updates node styles to set `visibility: hidden` for non-matching nodes
   - Updates edge styles to hide edges connecting to hidden nodes
   - Preserves all graph data while controlling visual appearance
   - Updates graph using `graph.setData()` and `graph.render()`
4. **Clear Filter**: Empty search makes all nodes visible again by setting `visibility: visible`

### Features

- **Case-insensitive search** (configurable)
- **Real-time filtering** as user types
- **Edge filtering** - only edges between visible nodes are shown
- **Toast notifications** for no results
- **Auto-fit view** after filtering
- **Cache refresh** on node updates

## Usage

### Basic Search

1. Load a namespace with resources
2. Type in the search box at the top
3. Graph automatically filters to show matching nodes
4. Clear search box to show all nodes

### Advanced Options

The filtering supports configuration options:

```javascript
filterNodes(graph, query, {
  caseSensitive: false, // Set to true for case-sensitive search
})
```

## API Reference

### filterNodes(graph, query, options)

Filters nodes based on search query.

**Parameters:**

- `graph` - The G6 graph instance
- `query` - Search string
- `options` - Configuration object
  - `caseSensitive` (boolean) - Whether search is case-sensitive

**Returns:** Number of visible nodes after filtering

### showAllNodes(graph)

Shows all nodes by clearing any active filter.

**Parameters:**

- `graph` - The G6 graph instance

**Returns:** Total number of nodes

### cacheGraphData(graph)

Caches current graph data for filtering operations.

**Parameters:**

- `graph` - The G6 graph instance

## Technical Notes

### Performance Considerations

- Caching prevents data loss during filtering operations
- Visibility-based approach preserves graph structure and relationships
- Edge visibility management reduces visual clutter
- No data removal ensures fast filter clearing

### Limitations

- Filtering is based on node labels only (not node types or other metadata)
- Large graphs (>1000 nodes) may experience slight delays during filtering
- Cache must be refreshed when nodes are added/removed

### Future Enhancements

- Filter by resource type (Pod, Service, etc.)
- Filter by namespace
- Filter by status (running, failed, etc.)
- Save filter presets
- Regular expression support

## Integration with Existing Code

The filtering system integrates seamlessly with the existing codebase:

1. **No breaking changes** to existing functionality
2. **Event-driven updates** when nodes are modified
3. **Consistent with existing patterns** in the codebase
4. **Modular design** for easy maintenance

## Testing

To test the filtering functionality:

1. Run the application: `make run`
2. Load a namespace with multiple resources
3. Use the search box to filter resources
4. Verify that:
   - Matching nodes remain visible
   - Non-matching nodes are hidden
   - Edges are filtered appropriately
   - View fits correctly after filtering
   - Filter can be cleared by emptying search box
