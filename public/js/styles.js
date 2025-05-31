// ==========================================================================================
// Style sheet for Cytoscape.js
// ==========================================================================================

import cytoscape from '../ext/cytoscape.esm.min.mjs'

const nodeStyle = {
  label: 'data(label)',
  shape: 'roundrectangle',
  width: 128,
  height: 128,
  'border-width': 0,
  'font-size': '20%',
  color: '#eee',
  'text-valign': 'bottom',
  'text-margin-y': '1vh',
  'text-outline-color': '#111',
  'text-outline-width': 4,
  // Super important! This makes the nodes have icons that match the resource type
  // See makeNode in graph.js for how this is set
  'background-image': 'data(icon)',
  'background-fit': 'contain',
  'background-opacity': 0,
}

const edgeStyle = {
  'target-arrow-shape': 'triangle',
  'curve-style': 'bezier',
  width: 6,
  'line-color': '#555',
  'arrow-scale': '1.5',
  'target-arrow-color': '#555',
}

export const styleSheet = cytoscape.stylesheet()

styleSheet.selector('node').style(nodeStyle)
styleSheet.selector('edge').style(edgeStyle)
styleSheet.selector('node:selected').style({
  'border-width': '5',
  'border-color': 'rgb(0, 120, 215)',
})
