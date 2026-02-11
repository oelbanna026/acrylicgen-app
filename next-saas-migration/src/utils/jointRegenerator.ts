import type { JointAnalysis, JointSettings, Point, Polyline } from '@/utils/types'
import { roundTo } from '@/utils/geometry'

function fitOffset(settings: JointSettings): number {
  const kerf = Math.max(0, settings.kerf ?? 0)
  const tol = Math.max(0, settings.tolerance)
  if (settings.fit === 'tight') return -(kerf / 2 + tol)
  if (settings.fit === 'loose') return -(kerf / 2 - tol)
  return -(kerf / 2)
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

function buildParametricEdge(pattern: Array<'tab' | 'slot'>, edgeLen: number, baseTooth: number, slotOffset: number) {
  const countRaw = Math.floor(edgeLen / Math.max(0.01, baseTooth))
  const count = Math.max(6, countRaw)
  const startType: 'tab' | 'slot' = pattern[0] ?? 'tab'
  const outPattern: Array<'tab' | 'slot'> = []
  for (let i = 0; i < count; i++) outPattern.push((i % 2 === 0 ? startType : startType === 'tab' ? 'slot' : 'tab') as any)

  const widths = outPattern.map((t) => {
    if (t === 'slot') return Math.max(0.01, baseTooth + 2 * slotOffset)
    return Math.max(0.01, baseTooth)
  })
  let total = widths.reduce((a, b) => a + b, 0)
  let safe = 0
  while (total > edgeLen && outPattern.length > 6 && safe++ < 50) {
    outPattern.pop()
    widths.pop()
    total = widths.reduce((a, b) => a + b, 0)
  }
  const startOffset = Math.max(0, (edgeLen - total) / 2)
  return { pattern: outPattern, widths, startOffset }
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

  const slotOffset = fitOffset(settings)
  const baseTooth = Math.max(0.01, settings.newJointWidth)
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

  const topParam = buildParametricEdge(top.pattern, width, baseTooth, slotOffset)
  const rightParam = buildParametricEdge(right.pattern, height, baseTooth, slotOffset)
  const bottomParam = buildParametricEdge(bottom.pattern, width, baseTooth, slotOffset)
  const leftParam = buildParametricEdge(left.pattern, height, baseTooth, slotOffset)

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
  if (topParam.startOffset > 0) {
    x = minX + topParam.startOffset
    pushPoint(pts, { x, y: topBaseline })
    y = topBaseline
  }
  for (let i = 0; i < topParam.pattern.length; i++) {
    const targetY = topParam.pattern[i] === 'tab' ? topBaseline : topInner
    if (y !== targetY) {
      y = targetY
      pushPoint(pts, { x, y })
    }
    x += topParam.widths[i]
    pushPoint(pts, { x, y })
  }
  if (y !== topBaseline) {
    y = topBaseline
    pushPoint(pts, { x, y })
  }
  if (x !== maxX) {
    x = maxX
    pushPoint(pts, { x, y })
  }

  const rightBaseline = maxX
  const rightInner = maxX - depth
  if (rightParam.startOffset > 0) {
    y = maxY - rightParam.startOffset
    pushPoint(pts, { x: rightBaseline, y })
    x = rightBaseline
  }
  for (let i = 0; i < rightParam.pattern.length; i++) {
    const targetX = rightParam.pattern[i] === 'tab' ? rightBaseline : rightInner
    if (x !== targetX) {
      x = targetX
      pushPoint(pts, { x, y })
    }
    y -= rightParam.widths[i]
    pushPoint(pts, { x, y })
  }
  if (x !== rightBaseline) {
    x = rightBaseline
    pushPoint(pts, { x, y })
  }
  if (y !== minY) {
    y = minY
    pushPoint(pts, { x, y })
  }

  const bottomBaseline = minY
  const bottomInner = minY + depth
  if (bottomParam.startOffset > 0) {
    x = maxX - bottomParam.startOffset
    pushPoint(pts, { x, y: bottomBaseline })
    y = bottomBaseline
  }
  for (let i = 0; i < bottomParam.pattern.length; i++) {
    const targetY = bottomParam.pattern[i] === 'tab' ? bottomBaseline : bottomInner
    if (y !== targetY) {
      y = targetY
      pushPoint(pts, { x, y })
    }
    x -= bottomParam.widths[i]
    pushPoint(pts, { x, y })
  }
  if (y !== bottomBaseline) {
    y = bottomBaseline
    pushPoint(pts, { x, y })
  }
  if (x !== minX) {
    x = minX
    pushPoint(pts, { x, y })
  }

  const leftBaseline = minX
  const leftInner = minX + depth
  if (leftParam.startOffset > 0) {
    y = minY + leftParam.startOffset
    pushPoint(pts, { x: leftBaseline, y })
    x = leftBaseline
  }
  for (let i = 0; i < leftParam.pattern.length; i++) {
    const targetX = leftParam.pattern[i] === 'tab' ? leftBaseline : leftInner
    if (x !== targetX) {
      x = targetX
      pushPoint(pts, { x, y })
    }
    y += leftParam.widths[i]
    pushPoint(pts, { x, y })
  }
  if (x !== leftBaseline) {
    x = leftBaseline
    pushPoint(pts, { x, y })
  }
  if (y !== maxY) {
    y = maxY
    pushPoint(pts, { x, y })
  }

  const polyline: Polyline = {
    ...original,
    closed: true,
    points: pts,
  }

  return { polyline, warnings }
}
