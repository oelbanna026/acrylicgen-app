import type { JointAnalysis, JointSettings, Point, Polyline } from '@/utils/types'
import { roundTo } from '@/utils/geometry'

function effectiveTolerance(settings: JointSettings): number {
  const base = settings.tolerance
  const delta = settings.fit === 'tight' ? -0.05 : settings.fit === 'loose' ? 0.05 : 0
  return Math.max(0, base + delta)
}

function buildSegmentLengths(pattern: Array<'tab' | 'slot'>, edgeLen: number, tabW: number, slotW: number): number[] {
  const raw = pattern.map((t) => (t === 'tab' ? tabW : slotW))
  const rawSum = raw.reduce((a, b) => a + b, 0)
  if (!(rawSum > 0) || !(edgeLen > 0)) return raw

  if (rawSum > edgeLen) {
    const scale = edgeLen / rawSum
    return raw.map((v) => v * scale)
  }

  const remaining = edgeLen - rawSum
  const extra = remaining / raw.length
  return raw.map((v) => v + extra)
}

function pushPoint(points: Point[], p: Point, precision = 2) {
  const last = points[points.length - 1]
  const q = { x: roundTo(p.x, precision), y: roundTo(p.y, precision) }
  if (last && last.x === q.x && last.y === q.y) return
  points.push(q)
}

export function regenerateFingerJointsRectangular(
  original: Polyline,
  analysis: JointAnalysis,
  settings: JointSettings,
): { polyline: Polyline; warnings: string[] } {
  const warnings: string[] = []

  const bbox = analysis.bbox
  const width = bbox.maxX - bbox.minX
  const height = bbox.maxY - bbox.minY
  if (!(width > 0) || !(height > 0)) {
    return { polyline: original, warnings: ['لا يمكن إعادة التوليد: صندوق الحدود غير صالح.'] }
  }

  const tol = effectiveTolerance(settings)
  const tabW = Math.max(0.01, settings.newJointWidth)
  const slotW = Math.max(0.01, settings.newJointWidth - tol)
  const depth = Math.max(0.01, settings.materialThickness)

  const edgeMap = new Map(analysis.edges.map((e) => [e.side, e]))
  const makeStraightEdge = (side: 'top' | 'bottom' | 'left' | 'right') => ({
    id: side,
    side,
    baseline: side === 'top' ? bbox.maxY : side === 'bottom' ? bbox.minY : side === 'left' ? bbox.minX : bbox.maxX,
    depth: 0,
    pattern: ['tab'] as Array<'tab' | 'slot'>,
    joints: [],
  })

  const top = edgeMap.get('top') ?? makeStraightEdge('top')
  const right = edgeMap.get('right') ?? makeStraightEdge('right')
  const bottom = edgeMap.get('bottom') ?? makeStraightEdge('bottom')
  const left = edgeMap.get('left') ?? makeStraightEdge('left')

  const topLens = buildSegmentLengths(top.pattern, width, tabW, slotW)
  const rightLens = buildSegmentLengths(right.pattern, height, tabW, slotW)
  const bottomLens = buildSegmentLengths(bottom.pattern, width, tabW, slotW)
  const leftLens = buildSegmentLengths(left.pattern, height, tabW, slotW)

  const pts: Point[] = []
  const minX = bbox.minX
  const maxX = bbox.maxX
  const minY = bbox.minY
  const maxY = bbox.maxY

  let x = minX
  let y = maxY
  pushPoint(pts, { x, y })

  const topBaseline = maxY
  const topInner = maxY - depth
  for (let i = 0; i < top.pattern.length; i++) {
    const targetY = top.pattern[i] === 'tab' ? topBaseline : topInner
    if (y !== targetY) {
      y = targetY
      pushPoint(pts, { x, y })
    }
    x += topLens[i]
    pushPoint(pts, { x, y })
  }
  if (Math.abs(x - maxX) > 0.02) {
    warnings.push('تم ضبط نقاط الحافة العلوية للوصول إلى الحد الخارجي.')
    x = maxX
    pushPoint(pts, { x, y })
  }
  if (y !== topBaseline) {
    y = topBaseline
    pushPoint(pts, { x, y })
  }

  const rightBaseline = maxX
  const rightInner = maxX - depth
  for (let i = 0; i < right.pattern.length; i++) {
    const targetX = right.pattern[i] === 'tab' ? rightBaseline : rightInner
    if (x !== targetX) {
      x = targetX
      pushPoint(pts, { x, y })
    }
    y -= rightLens[i]
    pushPoint(pts, { x, y })
  }
  if (Math.abs(y - minY) > 0.02) {
    warnings.push('تم ضبط نقاط الحافة اليمنى للوصول إلى الحد الخارجي.')
    y = minY
    pushPoint(pts, { x, y })
  }
  if (x !== rightBaseline) {
    x = rightBaseline
    pushPoint(pts, { x, y })
  }

  const bottomBaseline = minY
  const bottomInner = minY + depth
  for (let i = 0; i < bottom.pattern.length; i++) {
    const targetY = bottom.pattern[i] === 'tab' ? bottomBaseline : bottomInner
    if (y !== targetY) {
      y = targetY
      pushPoint(pts, { x, y })
    }
    x -= bottomLens[i]
    pushPoint(pts, { x, y })
  }
  if (Math.abs(x - minX) > 0.02) {
    warnings.push('تم ضبط نقاط الحافة السفلية للوصول إلى الحد الخارجي.')
    x = minX
    pushPoint(pts, { x, y })
  }
  if (y !== bottomBaseline) {
    y = bottomBaseline
    pushPoint(pts, { x, y })
  }

  const leftBaseline = minX
  const leftInner = minX + depth
  for (let i = 0; i < left.pattern.length; i++) {
    const targetX = left.pattern[i] === 'tab' ? leftBaseline : leftInner
    if (x !== targetX) {
      x = targetX
      pushPoint(pts, { x, y })
    }
    y += leftLens[i]
    pushPoint(pts, { x, y })
  }
  if (Math.abs(y - maxY) > 0.02) {
    warnings.push('تم ضبط نقاط الحافة اليسرى لإغلاق الشكل.')
    y = maxY
    pushPoint(pts, { x, y })
  }
  if (x !== leftBaseline) {
    x = leftBaseline
    pushPoint(pts, { x, y })
  }

  const polyline: Polyline = {
    ...original,
    closed: true,
    points: pts,
  }

  return { polyline, warnings }
}
