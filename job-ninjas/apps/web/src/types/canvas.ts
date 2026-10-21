export type Color = {
  r: number
  g: number
  b: number
}

export type Camera = {
  x: number
  y: number
  zoom: number
}

export enum LayerType {
  Rectangle,
  Ellipse,
  Path,
  Text,
  Note,
  Agent,
  Image,
  Slide,
}

export type RectangleLayer = {
  type: LayerType.Rectangle
  x: number
  y: number
  height: number
  width: number
  fill: Color
  value?: string
}

export type EllipseLayer = {
  type: LayerType.Ellipse
  x: number
  y: number
  height: number
  width: number
  fill: Color
  value?: string
}

export type PathLayer = {
  type: LayerType.Path
  x: number
  y: number
  height: number
  width: number
  fill: Color
  points: number[][]
  value?: string
}

export type TextLayer = {
  type: LayerType.Text
  x: number
  y: number
  height: number
  width: number
  fill: Color
  value?: string
}

export type NoteLayer = {
  type: LayerType.Note
  x: number
  y: number
  height: number
  width: number
  fill: Color
  value?: string
}

export type AgentLayer = {
  type: LayerType.Agent
  x: number
  y: number
  height: number
  width: number
  fill: Color
  agentRole?: string // e.g. 'resume-analyzer', 'interview-agent'
  status?: 'idle' | 'running' | 'success' | 'error'
  result?: string // JSON string or text result
  value?: string // Name of the agent
  config?: any // To store properties like jobTitle, jobDescription
  outputData?: any
  inputData?: any
  executionTimeMs?: number
  errorDetails?: string
  runId?: string
}

export type ImageLayer = {
  type: LayerType.Image
  x: number
  y: number
  height: number
  width: number
  fill: Color
  src: string
}

export type SlideLayer = {
  type: LayerType.Slide
  x: number
  y: number
  height: number
  width: number
  fill: Color
  value?: string // Title of the slide
  fileSrc?: string // Base64 or URL to the PDF/PPT
  fileName?: string
}

export type Edge = {
  id: string
  fromNodeId: string
  toNodeId: string
  label?: string
}

export type Point = {
  x: number
  y: number
}

export type XYWH = {
  x: number
  y: number
  width: number
  height: number
}

export enum Side {
  Top = 1,
  Bottom = 2,
  Left = 4,
  Right = 8,
}

export type CanvasState =
  | {
      mode: CanvasMode.None
    }
  | {
      mode: CanvasMode.SelectionNet
      origin: Point
      current?: Point
    }
  | {
      mode: CanvasMode.Translating
      current: Point
    }
  | {
      mode: CanvasMode.Inserting
      layerType:
        | LayerType.Ellipse
        | LayerType.Rectangle
        | LayerType.Text
        | LayerType.Note
        | LayerType.Agent
        | LayerType.Image
        | LayerType.Slide
      agentRole?: string
      src?: string
    }
  | {
      mode: CanvasMode.Pencil
    }
  | {
      mode: CanvasMode.Connecting
      fromNodeId?: string
      toNodeId?: string
      currentPoint?: Point
    }
  | {
      mode: CanvasMode.Pressing
      origin: Point
    }
  | {
      mode: CanvasMode.Resizing
      initialBounds: XYWH
      corner: Side
    }

export enum CanvasMode {
  None,
  Pressing,
  SelectionNet,
  Translating,
  Inserting,
  Resizing,
  Pencil,
  Connecting,
}

export type Layer =
  | RectangleLayer
  | EllipseLayer
  | PathLayer
  | TextLayer
  | NoteLayer
  | AgentLayer
  | ImageLayer
  | SlideLayer
