import type { DxfModel, Point, Polyline } from '@/utils/types'
import { bboxOf, roundTo } from '@/utils/geometry'

function polylineToSvgPath(pl: Polyline, precision = 2): string {
  if (!pl.points.length) return ''
  const pts = pl.points
  let d = `M ${roundTo(pts[0].x, precision)} ${roundTo(-pts[0].y, precision)}`
  for (let i = 1; i < pts.length; i++) {
    d += ` L ${roundTo(pts[i].x, precision)} ${roundTo(-pts[i].y, precision)}`
  }
  if (pl.closed) d += ' Z'
  return d
}

export function exportModelToSvg(model: DxfModel, opts?: { strokeWidth?: number }): string {
  const allPoints: Point[] = []
  for (const pl of model.polylines) allPoints.push(...pl.points)
  const bb = bboxOf(allPoints)
  const w = bb.maxX - bb.minX
  const h = bb.maxY - bb.minY
  const strokeWidth = opts?.strokeWidth ?? Math.max(Math.min(w, h) * 0.001, 0.2)
  const viewBox = `${bb.minX} ${-bb.maxY} ${w} ${h}`

  const paths = model.polylines
    .map((pl) => {
      const d = polylineToSvgPath(pl)
      if (!d) return ''
      return `<path d="${d}" fill="none" stroke="black" stroke-width="${strokeWidth}" />`
    })
    .filter(Boolean)
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">\n${paths}\n</svg>\n`
}

function dxfHeader(): string {
  return [
    '0',
    'SECTION',
    '2',
    'HEADER',
    '0',
    'ENDSEC',
    '0',
    'SECTION',
    '2',
    'ENTITIES',
  ].join('\n')
}

function dxfFooter(): string {
  return ['0', 'ENDSEC', '0', 'EOF'].join('\n')
}

function writeLwPolyline(pl: Polyline, layer = '0', precision = 4): string {
  const pts = pl.points
  const out: string[] = []
  out.push('0', 'LWPOLYLINE')
  out.push('8', layer)
  out.push('90', String(pts.length))
  out.push('70', pl.closed ? '1' : '0')
  for (const p of pts) {
    out.push('10', String(roundTo(p.x, precision)))
    out.push('20', String(roundTo(p.y, precision)))
  }
  return out.join('\n')
}

export function exportModelToDxf(model: DxfModel): string {
  const entities: string[] = []
  for (const pl of model.polylines) {
    if (pl.points.length < 2) continue
    entities.push(writeLwPolyline(pl, pl.layer ?? '0'))
  }
  return `${dxfHeader()}\n${entities.join('\n')}\n${dxfFooter()}\n`
}

