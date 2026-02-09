import type { Point } from '@/utils/types'

export function isFinitePoint(p: Point): boolean {
  return Number.isFinite(p.x) && Number.isFinite(p.y)
}

export function dist(a: Point, b: Point): number {
  return Math.hypot(b.x - a.x, b.y - a.y)
}

export function bboxOf(points: Point[]) {
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity
  for (const p of points) {
    if (!isFinitePoint(p)) continue
    if (p.x < minX) minX = p.x
    if (p.y < minY) minY = p.y
    if (p.x > maxX) maxX = p.x
    if (p.y > maxY) maxY = p.y
  }
  return { minX, minY, maxX, maxY }
}

export function polygonArea(points: Point[]): number {
  if (points.length < 3) return 0
  let sum = 0
  for (let i = 0; i < points.length; i++) {
    const a = points[i]
    const b = points[(i + 1) % points.length]
    sum += a.x * b.y - b.x * a.y
  }
  return sum / 2
}

export function simplifyCollinear(points: Point[], opts?: { eps?: number; closed?: boolean }): Point[] {
  const eps = opts?.eps ?? 1e-3
  const closed = opts?.closed ?? false
  if (points.length < 3) return points.slice()

  const pts = points.slice()
  const n = pts.length

  const keep: Point[] = []
  const limit = closed ? n : n - 1
  for (let i = 0; i < limit; i++) {
    const prev = pts[(i - 1 + n) % n]
    const curr = pts[i]
    const next = pts[(i + 1) % n]

    const v1x = curr.x - prev.x
    const v1y = curr.y - prev.y
    const v2x = next.x - curr.x
    const v2y = next.y - curr.y
    const len1 = Math.hypot(v1x, v1y)
    const len2 = Math.hypot(v2x, v2y)
    if (len1 < eps || len2 < eps) continue

    const cross = (v1x * v2y - v1y * v2x) / (len1 * len2)
    const dot = (v1x * v2x + v1y * v2y) / (len1 * len2)
    if (Math.abs(cross) < 0.01 && dot > 0.99) continue

    keep.push(curr)
  }
  if (!closed) {
    keep.unshift(pts[0])
    keep.push(pts[n - 1])
  }
  return keep
}

export function almostEqual(a: number, b: number, eps: number): boolean {
  return Math.abs(a - b) <= eps
}

export function roundTo(value: number, decimals: number): number {
  const p = Math.pow(10, decimals)
  return Math.round(value * p) / p
}

export function quantize(value: number, step: number): number {
  if (!Number.isFinite(step) || step <= 0) return value
  return Math.round(value / step) * step
}

export function mode(values: number[], opts?: { bin?: number }): number | null {
  if (!values.length) return null
  const bin = opts?.bin ?? 0.01
  const counts = new Map<number, number>()
  for (const v of values) {
    const key = quantize(v, bin)
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }
  let bestKey: number | null = null
  let bestCount = -1
  for (const [k, c] of Array.from(counts.entries())) {
    if (c > bestCount) {
      bestCount = c
      bestKey = k
    }
  }
  return bestKey
}
