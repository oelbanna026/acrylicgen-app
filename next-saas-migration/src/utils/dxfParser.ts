import DxfParser from 'dxf-parser'
import type { DxfModel, Point, Polyline } from '@/utils/types'
import { bboxOf, dist, simplifyCollinear } from '@/utils/geometry'

type RawVertex = { x: number; y: number; bulge?: number }

function arcPointsFromBulge(p1: Point, p2: Point, bulge: number, segments = 12): Point[] {
  const chord = dist(p1, p2)
  if (!Number.isFinite(chord) || chord <= 0) return []
  if (!Number.isFinite(bulge) || bulge === 0) return []

  const theta = 4 * Math.atan(bulge)
  const radius = chord / (2 * Math.sin(Math.abs(theta) / 2))
  if (!Number.isFinite(radius) || radius <= 0) return []

  const mid = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 }
  const dx = (p2.x - p1.x) / chord
  const dy = (p2.y - p1.y) / chord

  const sagitta = (bulge * chord) / 2
  const cx = mid.x - dy * sagitta
  const cy = mid.y + dx * sagitta

  const a0 = Math.atan2(p1.y - cy, p1.x - cx)
  const a1 = a0 + theta

  const pts: Point[] = []
  const steps = Math.max(3, segments)
  for (let i = 1; i < steps; i++) {
    const t = i / steps
    const a = a0 + (a1 - a0) * t
    pts.push({ x: cx + radius * Math.cos(a), y: cy + radius * Math.sin(a) })
  }
  return pts
}

function toPolylineId(index: number) {
  return `pl_${index}`
}

export function parseDxfToModel(dxfText: string): DxfModel {
  const parser = new DxfParser()
  const doc = parser.parseSync(dxfText)
  const entities = Array.isArray(doc.entities) ? doc.entities : []

  const polylines: Polyline[] = []
  let polyIndex = 0

  for (const ent of entities) {
    const type = (ent as any).type
    if (!type) continue

    if (type === 'LWPOLYLINE' || type === 'POLYLINE') {
      const layer = (ent as any).layer as string | undefined
      const closed = Boolean((ent as any).shape) || Boolean((ent as any).closed)
      const rawVerts: RawVertex[] = Array.isArray((ent as any).vertices) ? (ent as any).vertices : []
      if (rawVerts.length < 2) continue

      const points: Point[] = []
      for (let i = 0; i < rawVerts.length; i++) {
        const v = rawVerts[i]
        const p = { x: Number(v.x), y: Number(v.y) }
        points.push(p)
        const bulge = Number(v.bulge ?? 0)
        const next = rawVerts[(i + 1) % rawVerts.length]
        const isLast = i === rawVerts.length - 1
        if (isLast && !closed) continue
        if (bulge) {
          const p2 = { x: Number(next.x), y: Number(next.y) }
          points.push(...arcPointsFromBulge(p, p2, bulge))
        }
      }

      const clean = simplifyCollinear(points, { eps: 1e-6, closed })
      if (clean.length < 2) continue
      polylines.push({ id: toPolylineId(polyIndex++), layer, closed, points: clean })
      continue
    }

    if (type === 'LINE') {
      const layer = (ent as any).layer as string | undefined
      const start = (ent as any).start
      const end = (ent as any).end
      if (!start || !end) continue
      const p1 = { x: Number(start.x), y: Number(start.y) }
      const p2 = { x: Number(end.x), y: Number(end.y) }
      polylines.push({ id: toPolylineId(polyIndex++), layer, closed: false, points: [p1, p2] })
      continue
    }
  }

  return { polylines, sourceUnits: 'unknown' }
}

export function pickLargestClosedPolyline(model: DxfModel): Polyline | null {
  const closed = model.polylines.filter((p) => p.closed && p.points.length >= 3)
  if (!closed.length) return null
  let best: Polyline | null = null
  let bestArea = -Infinity
  for (const pl of closed) {
    const bb = bboxOf(pl.points)
    const area = (bb.maxX - bb.minX) * (bb.maxY - bb.minY)
    if (area > bestArea) {
      bestArea = area
      best = pl
    }
  }
  return best
}

