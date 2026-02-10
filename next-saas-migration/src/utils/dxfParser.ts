import DxfParser from 'dxf-parser'
import type { DxfModel, Point, Polyline } from '@/utils/types'
import { bboxOf, dist, simplifyCollinear } from '@/utils/geometry'

type RawVertex = { x: number; y: number; bulge?: number }

type Transform = { a: number; b: number; c: number; d: number; e: number; f: number }

function identity(): Transform {
  return { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 }
}

function mul(t1: Transform, t2: Transform): Transform {
  return {
    a: t1.a * t2.a + t1.c * t2.b,
    b: t1.b * t2.a + t1.d * t2.b,
    c: t1.a * t2.c + t1.c * t2.d,
    d: t1.b * t2.c + t1.d * t2.d,
    e: t1.a * t2.e + t1.c * t2.f + t1.e,
    f: t1.b * t2.e + t1.d * t2.f + t1.f,
  }
}

function translate(tx: number, ty: number): Transform {
  return { a: 1, b: 0, c: 0, d: 1, e: tx, f: ty }
}

function scale(sx: number, sy: number): Transform {
  return { a: sx, b: 0, c: 0, d: sy, e: 0, f: 0 }
}

function rotate(rad: number): Transform {
  const cos = Math.cos(rad)
  const sin = Math.sin(rad)
  return { a: cos, b: sin, c: -sin, d: cos, e: 0, f: 0 }
}

function applyT(p: Point, t: Transform): Point {
  return { x: t.a * p.x + t.c * p.y + t.e, y: t.b * p.x + t.d * p.y + t.f }
}

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

  const blocks: Record<string, any> = (doc as any).blocks ?? {}

  const getBlockEntities = (name: string): any[] => {
    const block = blocks?.[name]
    if (!block) return []
    const ents = block.entities ?? block.entities ?? block
    return Array.isArray(ents) ? ents : Array.isArray(block.entities) ? block.entities : []
  }

  const pushPolyline = (pl: Omit<Polyline, 'id'>) => {
    if (pl.points.length < 2) return
    polylines.push({ id: toPolylineId(polyIndex++), ...pl })
  }

  const handleEntity = (ent: any, t: Transform, layerOverride?: string, depth = 0) => {
    if (!ent || depth > 10) return
    const type = ent.type
    if (!type) return

    if (type === 'INSERT') {
      const blockName: string | undefined = ent.name ?? ent.block ?? ent.blockName
      if (!blockName) return

      const pos = ent.position ?? ent.insertionPoint ?? ent.insertPoint ?? ent.point ?? ent.start
      const tx = Number(pos?.x ?? 0)
      const ty = Number(pos?.y ?? 0)
      const rotDeg = Number(ent.rotation ?? 0)
      const sx = Number(ent.xScale ?? ent.xscale ?? ent.scaleX ?? ent.xscaleFactor ?? 1)
      const sy = Number(ent.yScale ?? ent.yscale ?? ent.scaleY ?? ent.yscaleFactor ?? 1)
      const insertLayer = layerOverride ?? (ent.layer as string | undefined)

      const local = mul(translate(tx, ty), mul(rotate((rotDeg * Math.PI) / 180), scale(sx || 1, sy || 1)))
      const nextT = mul(t, local)

      const blockEnts = getBlockEntities(blockName)
      for (const be of blockEnts) handleEntity(be, nextT, insertLayer, depth + 1)
      return
    }

    if (type === 'LWPOLYLINE' || type === 'POLYLINE') {
      const layer = layerOverride ?? (ent.layer as string | undefined)
      const closed = Boolean(ent.shape) || Boolean(ent.closed)
      const rawVerts: RawVertex[] = Array.isArray(ent.vertices) ? ent.vertices : []
      if (rawVerts.length < 2) return

      const points: Point[] = []
      for (let i = 0; i < rawVerts.length; i++) {
        const v = rawVerts[i]
        const p = applyT({ x: Number(v.x), y: Number(v.y) }, t)
        points.push(p)
        const bulge = Number(v.bulge ?? 0)
        const next = rawVerts[(i + 1) % rawVerts.length]
        const isLast = i === rawVerts.length - 1
        if (isLast && !closed) continue
        if (bulge) {
          const p2 = applyT({ x: Number(next.x), y: Number(next.y) }, t)
          points.push(...arcPointsFromBulge(p, p2, bulge))
        }
      }

      const clean = simplifyCollinear(points, { eps: 1e-6, closed })
      if (clean.length < 2) return
      pushPolyline({ layer, closed, points: clean })
      return
    }

    if (type === 'LINE') {
      const layer = layerOverride ?? (ent.layer as string | undefined)
      const start = ent.start
      const end = ent.end
      if (!start || !end) return
      const p1 = applyT({ x: Number(start.x), y: Number(start.y) }, t)
      const p2 = applyT({ x: Number(end.x), y: Number(end.y) }, t)
      pushPolyline({ layer, closed: false, points: [p1, p2] })
      return
    }

    if (type === 'CIRCLE') {
      const layer = layerOverride ?? (ent.layer as string | undefined)
      const center = ent.center
      const radius = Number(ent.radius)
      if (!center || !Number.isFinite(radius) || radius <= 0) return
      const steps = 48
      const pts: Point[] = []
      for (let i = 0; i < steps; i++) {
        const a = (i / steps) * Math.PI * 2
        pts.push(applyT({ x: Number(center.x) + radius * Math.cos(a), y: Number(center.y) + radius * Math.sin(a) }, t))
      }
      pushPolyline({ layer, closed: true, points: pts })
      return
    }

    if (type === 'ARC') {
      const layer = layerOverride ?? (ent.layer as string | undefined)
      const center = ent.center
      const radius = Number(ent.radius)
      const startAngle = Number(ent.startAngle)
      const endAngle = Number(ent.endAngle)
      if (!center || !Number.isFinite(radius) || radius <= 0) return
      if (!Number.isFinite(startAngle) || !Number.isFinite(endAngle)) return
      const a0 = (startAngle * Math.PI) / 180
      let a1 = (endAngle * Math.PI) / 180
      while (a1 < a0) a1 += Math.PI * 2
      const sweep = a1 - a0
      const steps = Math.max(8, Math.ceil((sweep / (Math.PI * 2)) * 64))
      const pts: Point[] = []
      for (let i = 0; i <= steps; i++) {
        const a = a0 + (sweep * i) / steps
        pts.push(applyT({ x: Number(center.x) + radius * Math.cos(a), y: Number(center.y) + radius * Math.sin(a) }, t))
      }
      pushPolyline({ layer, closed: false, points: pts })
      return
    }
  }

  for (const ent of entities) handleEntity(ent as any, identity())

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
