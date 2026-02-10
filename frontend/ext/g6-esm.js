/**
 * G6 Graph Visualization Library - ES Module Wrapper
 * This wraps the G6 UMD library and exports its components as ES modules
 */

// Import the UMD library - it will attach to globalThis/window as G6
import './g6.min.js'

// Extract the G6 namespace from global scope
const G6 = globalThis.G6 || window.G6

if (!G6) {
  throw new Error('G6 library failed to load')
}

// Export the main Graph class
export const Graph = G6.Graph

// Export commonly used components
export const Canvas = G6.Canvas

// Export event constants
export const NodeEvent = G6.NodeEvent
export const EdgeEvent = G6.EdgeEvent
export const ComboEvent = G6.ComboEvent
export const CanvasEvent = G6.CanvasEvent
export const GraphEvent = G6.GraphEvent
export const CommonEvent = G6.CommonEvent
export const ContainerEvent = G6.ContainerEvent
export const HistoryEvent = G6.HistoryEvent

// Export node types
export const Circle = G6.Circle
export const Rect = G6.Rect
export const Diamond = G6.Diamond
export const Ellipse = G6.Ellipse
export const Star = G6.Star
export const Triangle = G6.Triangle
export const Hexagon = G6.Hexagon
export const Image = G6.Image
export const HTML = G6.HTML
export const Donut = G6.Donut

// Export edge types
export const Line = G6.Line
export const Polyline = G6.Polyline
export const Cubic = G6.Cubic
export const Quadratic = G6.Quadratic
export const CubicHorizontal = G6.CubicHorizontal
export const CubicVertical = G6.CubicVertical
export const CubicRadial = G6.CubicRadial

// Export combo types
export const CircleCombo = G6.CircleCombo
export const RectCombo = G6.RectCombo

// Export layout algorithms
export const CircularLayout = G6.CircularLayout
export const ConcentricLayout = G6.ConcentricLayout
export const GridLayout = G6.GridLayout
export const RandomLayout = G6.RandomLayout
export const RadialLayout = G6.RadialLayout
export const ForceLayout = G6.ForceLayout
export const FruchtermanLayout = G6.FruchtermanLayout
export const D3ForceLayout = G6.D3ForceLayout
export const DagreLayout = G6.DagreLayout
export const AntVDagreLayout = G6.AntVDagreLayout
export const MDSLayout = G6.MDSLayout
export const CompactBoxLayout = G6.CompactBoxLayout
export const DendrogramLayout = G6.DendrogramLayout
export const IndentedLayout = G6.IndentedLayout
export const MindmapLayout = G6.MindmapLayout
export const FishboneLayout = G6.FishboneLayout
export const SnakeLayout = G6.SnakeLayout
export const ComboCombinedLayout = G6.ComboCombinedLayout
export const ForceAtlas2Layout = G6.ForceAtlas2Layout

// Export behaviors
export const DragCanvas = G6.DragCanvas
export const ZoomCanvas = G6.ZoomCanvas
export const ScrollCanvas = G6.ScrollCanvas
export const DragElement = G6.DragElement
export const DragElementForce = G6.DragElementForce
export const ClickSelect = G6.ClickSelect
export const BrushSelect = G6.BrushSelect
export const LassoSelect = G6.LassoSelect
export const HoverActivate = G6.HoverActivate
export const FocusElement = G6.FocusElement
export const CollapseExpand = G6.CollapseExpand
export const CreateEdge = G6.CreateEdge
export const FixElementSize = G6.FixElementSize
export const OptimizeViewportTransform = G6.OptimizeViewportTransform
export const AutoAdaptLabel = G6.AutoAdaptLabel

// Export plugins
export const Minimap = G6.Minimap
export const Toolbar = G6.Toolbar
export const Tooltip = G6.Tooltip
export const Fisheye = G6.Fisheye
export const EdgeBundling = G6.EdgeBundling
export const EdgeFilterLens = G6.EdgeFilterLens
export const Hull = G6.Hull
export const Snapline = G6.Snapline
export const GridLine = G6.GridLine
export const Background = G6.Background
export const Watermark = G6.Watermark
export const Contextmenu = G6.Contextmenu
export const Legend = G6.Legend
export const Timebar = G6.Timebar
export const History = G6.History
export const Fullscreen = G6.Fullscreen
export const BubbleSets = G6.BubbleSets

// Export transforms
export const MapNodeSize = G6.MapNodeSize
export const ProcessParallelEdges = G6.ProcessParallelEdges
export const PlaceRadialLabels = G6.PlaceRadialLabels

// Export utility functions
export const register = G6.register
export const getExtension = G6.getExtension
export const getExtensions = G6.getExtensions
export const idOf = G6.idOf
export const positionOf = G6.positionOf
export const parseSize = G6.parseSize
export const isCollapsed = G6.isCollapsed
export const setVisibility = G6.setVisibility
export const invokeLayoutMethod = G6.invokeLayoutMethod
export const treeToGraphData = G6.treeToGraphData
export const effect = G6.effect
export const omitStyleProps = G6.omitStyleProps
export const subStyleProps = G6.subStyleProps

// Export base classes for extending
export const BaseNode = G6.BaseNode
export const BaseEdge = G6.BaseEdge
export const BaseCombo = G6.BaseCombo
export const BaseBehavior = G6.BaseBehavior
export const BaseLayout = G6.BaseLayout
export const BasePlugin = G6.BasePlugin
export const BaseTransform = G6.BaseTransform
export const BaseShape = G6.BaseShape

// Export shapes
export const Badge = G6.Badge
export const Icon = G6.Icon
export const Label = G6.Label

// Export version
export const version = G6.version

// Export iconfont configuration
export const iconfont = G6.iconfont

// Export the entire G6 namespace as default
export default G6
