import type { Joint, JointAnalysis, JointEdge, JointType, Point, Polyline } from '@/utils/types'
import { bboxOf, mode, roundTo } from '@/utils/geometry'

type Segment = {
  a: Point
  b: Point
  dx: number
  dy: number
  len: number
}

function segmentsOf(polyline: Polyline): Segment[] {
  const pts = polyline.points
  const segs: Segment[] = []
  const limit = polyline.closed ? pts.length : pts.length - 1
  for (let i = 0; i < limit; i++) {
    const a = pts[i]
    const b = pts[(i + 1) % pts.length]
    const dx = b.x - a.x
    const dy = b.y - a.y
    const len = Math.hypot(dx, dy)
    if (!Number.isFinite(len) || len <= 1e-9) continue
    segs.push({ a, b, dx, dy, len })
  }
  return segs
}

function isAxisAligned(segs: Segment[], eps: number): boolean {
  if (!segs.length) return false
  let alignedLen = 0
  let total = 0
  for (const s of segs) {
    total += s.len
    if (Math.abs(s.dx) <= eps || Math.abs(s.dy) <= eps) alignedLen += s.len
  }
  return total > 0 && alignedLen / total >= 0.95
}

export function analyzeFingerJoints(polyline: Polyline): JointAnalysis {
  const bbox = bboxOf(polyline.points)
  const warnings: string[] = []

  const segs = segmentsOf(polyline)
  const eps = Math.max((bbox.maxX - bbox.minX + bbox.maxY - bbox.minY) * 1e-7, 1e-4)
  if (!isAxisAligned(segs, eps)) {
    warnings.push('الملف لا يبدو Axis-Aligned بالكامل؛ الكشف التلقائي الحالي يدعم التصميمات المتعامدة فقط.')
  }

  const topY = bbox.maxY
  const bottomY = bbox.minY
  const leftX = bbox.minX
  const rightX = bbox.maxX

  const horiz = segs.filter((s) => Math.abs(s.dy) <= eps)
  const vert = segs.filter((s) => Math.abs(s.dx) <= eps)

  const detectDepth = (side: 'top' | 'bottom' | 'left' | 'right'): number | null => {
    const depths: number[] = []
    if (side === 'top') {
      for (const s of horiz) {
        const y = s.a.y
        const d = topY - y
        if (d > eps && d < (bbox.maxY - bbox.minY) * 0.9) depths.push(d)
      }
    } else if (side === 'bottom') {
      for (const s of horiz) {
        const y = s.a.y
        const d = y - bottomY
        if (d > eps && d < (bbox.maxY - bbox.minY) * 0.9) depths.push(d)
      }
    } else if (side === 'left') {
      for (const s of vert) {
        const x = s.a.x
        const d = x - leftX
        if (d > eps && d < (bbox.maxX - bbox.minX) * 0.9) depths.push(d)
      }
    } else {
      for (const s of vert) {
        const x = s.a.x
        const d = rightX - x
        if (d > eps && d < (bbox.maxX - bbox.minX) * 0.9) depths.push(d)
      }
    }
    return mode(depths, { bin: 0.01 }) ?? null
  }

  const depthTop = detectDepth('top')
  const depthBottom = detectDepth('bottom')
  const depthLeft = detectDepth('left')
  const depthRight = detectDepth('right')

  const depthCandidates = [depthTop, depthBottom, depthLeft, depthRight].filter(
    (v): v is number => typeof v === 'number' && Number.isFinite(v) && v > 0,
  )
  const detectedDepth = depthCandidates.length ? mode(depthCandidates, { bin: 0.01 }) : null

  const edges: JointEdge[] = []

  const edgeSpan = (side: 'top' | 'bottom' | 'left' | 'right') =>
    side === 'top' || side === 'bottom' ? bbox.maxX - bbox.minX : bbox.maxY - bbox.minY

  const mergeSegments = (items: { start: number; end: number; coord: number; type: JointType }[], mergeEps: number) => {
    if (!items.length) return items
    const sorted = items.slice().sort((a, b) => a.start - b.start)
    const out: typeof sorted = [sorted[0]]
    for (let i = 1; i < sorted.length; i++) {
      const prev = out[out.length - 1]
      const cur = sorted[i]
      if (cur.type === prev.type && Math.abs(cur.coord - prev.coord) <= mergeEps && cur.start <= prev.end + mergeEps) {
        prev.end = Math.max(prev.end, cur.end)
      } else {
        out.push(cur)
      }
    }
    return out
  }

  const filterWidths = <T extends { start: number; end: number }>(
    side: 'top' | 'bottom' | 'left' | 'right',
    items: T[],
    depth: number | null,
  ) => {
    const span = edgeSpan(side)
    const d = depth ?? detectedDepth ?? null
    const minW = Math.max(span * 0.004, d ? d * 0.6 : span * 0.01, 0.05)
    const maxW = Math.max(span * 0.45, minW + 1e-6)
    return items.filter((s) => {
      const w = s.end - s.start
      return Number.isFinite(w) && w >= minW && w <= maxW
    })
  }

  const collectEdgeSegments = (side: 'top' | 'bottom' | 'left' | 'right', depth: number | null) => {
    const segments: { start: number; end: number; coord: number; type: JointType }[] = []
    const depthEps = Math.max(eps * 5, 0.01)

    if (side === 'top' || side === 'bottom') {
      const baseline = side === 'top' ? topY : bottomY
      const inner = depth ? (side === 'top' ? baseline - depth : baseline + depth) : null
      for (const s of horiz) {
        const y = s.a.y
        const x1 = s.a.x
        const x2 = s.b.x
        const start = Math.min(x1, x2)
        const end = Math.max(x1, x2)
        if (end - start <= eps) continue
        const isBaseline = Math.abs(y - baseline) <= depthEps
        const isInner = inner !== null && Math.abs(y - inner) <= depthEps
        if (!isBaseline && !isInner) continue
        if (start < bbox.minX - depthEps || end > bbox.maxX + depthEps) continue
        segments.push({
          start,
          end,
          coord: y,
          type: isBaseline ? 'tab' : 'slot',
        })
      }
    } else {
      const baseline = side === 'right' ? rightX : leftX
      const inner = depth ? (side === 'right' ? baseline - depth : baseline + depth) : null
      for (const s of vert) {
        const x = s.a.x
        const y1 = s.a.y
        const y2 = s.b.y
        const start = Math.min(y1, y2)
        const end = Math.max(y1, y2)
        if (end - start <= eps) continue
        const isBaseline = Math.abs(x - baseline) <= depthEps
        const isInner = inner !== null && Math.abs(x - inner) <= depthEps
        if (!isBaseline && !isInner) continue
        if (start < bbox.minY - depthEps || end > bbox.maxY + depthEps) continue
        segments.push({
          start,
          end,
          coord: x,
          type: isBaseline ? 'tab' : 'slot',
        })
      }
    }

    return segments
  }

  const buildEdge = (side: 'top' | 'bottom' | 'left' | 'right', depth: number | null) => {
    const baseline =
      side === 'top' ? topY : side === 'bottom' ? bottomY : side === 'left' ? leftX : rightX
    const segs = mergeSegments(collectEdgeSegments(side, depth), Math.max(eps * 20, 0.02))
    if (!segs.length) return

    const sorted0 = segs.filter((s) => s.end - s.start > eps).sort((a, b) => a.start - b.start)
    const filtered = filterWidths(side, sorted0, depth)
    const sorted = filtered.length ? filtered : sorted0

    const widths = sorted.map((s) => s.end - s.start).filter((w) => w > eps)
    const bin = Math.max(edgeSpan(side) * 0.001, 0.01)
    const wMode = mode(widths, { bin })

    const pattern: JointType[] = []
    const joints: Joint[] = []
    for (let i = 0; i < sorted.length; i++) {
      const s = sorted[i]
      pattern.push(s.type)
      const width = s.end - s.start
      const mid = (s.start + s.end) / 2
      const position =
        side === 'top' || side === 'bottom'
          ? { x: mid, y: baseline }
          : { x: baseline, y: mid }
      joints.push({
        type: s.type,
        width: roundTo(width, 2),
        depth: roundTo(depth ?? 0, 2),
        position,
        edgeId: side,
        indexOnEdge: i,
      })
    }

    edges.push({
      id: side,
      side,
      baseline,
      depth: depth ?? 0,
      pattern,
      joints,
    })

    return wMode
  }

  const widths: number[] = []
  const wTop = buildEdge('top', depthTop)
  if (typeof wTop === 'number') widths.push(wTop)
  const wBottom = buildEdge('bottom', depthBottom)
  if (typeof wBottom === 'number') widths.push(wBottom)
  const wLeft = buildEdge('left', depthLeft)
  if (typeof wLeft === 'number') widths.push(wLeft)
  const wRight = buildEdge('right', depthRight)
  if (typeof wRight === 'number') widths.push(wRight)

  const detectedJointWidth = widths.length ? mode(widths, { bin: 0.01 }) : null
  const totalJoints = edges.reduce((sum, e) => sum + e.joints.length, 0)

  if (!totalJoints) warnings.push('لم يتم اكتشاف تعشيقات على حدود الشكل الحالي.')

  return {
    polylineId: polyline.id,
    bbox,
    detectedJointWidth,
    detectedDepth,
    totalJoints,
    edges,
    warnings,
  }
}
