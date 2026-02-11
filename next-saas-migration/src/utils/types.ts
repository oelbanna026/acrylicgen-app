export type Point = { x: number; y: number }

export type Polyline = {
  id: string
  layer?: string
  closed: boolean
  points: Point[]
}

export type DxfModel = {
  polylines: Polyline[]
  sourceUnits?: 'mm' | 'inch' | 'unknown'
}

export type JointType = 'tab' | 'slot'
export type EdgeSide = 'top' | 'bottom' | 'left' | 'right'

export type Joint = {
  type: JointType
  width: number
  depth: number
  position: Point
  edgeId: string
  indexOnEdge: number
}

export type JointEdge = {
  id: string
  side: EdgeSide
  baseline: number
  depth: number
  pattern: JointType[]
  joints: Joint[]
}

export type JointAnalysis = {
  polylineId: string
  bbox: { minX: number; minY: number; maxX: number; maxY: number }
  detectedJointWidth: number | null
  detectedDepth: number | null
  totalJoints: number
  edges: JointEdge[]
  warnings: string[]
}

export type FitType = 'tight' | 'normal' | 'loose'

export type JointSettings = {
  newJointWidth: number
  materialThickness: number
  tolerance: number
  kerf?: number
  fit: FitType
}
