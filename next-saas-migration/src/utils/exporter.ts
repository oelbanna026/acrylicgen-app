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

function insUnitsCode(units: 'mm' | 'inch' | 'cm' | 'm' | 'unknown' | undefined): number | null {
  if (units === 'inch') return 1
  if (units === 'mm') return 4
  if (units === 'cm') return 5
  if (units === 'm') return 6
  return null
}

function convertFactorToMm(units: DxfModel['sourceUnits']): number {
  if (units === 'inch') return 25.4
  if (units === 'mm') return 1
  return 1
}

function scaleModel(model: DxfModel, factor: number): DxfModel {
  if (!Number.isFinite(factor) || factor === 1) return model
  return {
    ...model,
    polylines: model.polylines.map((pl) => ({
      ...pl,
      points: pl.points.map((p) => ({ x: p.x * factor, y: p.y * factor })),
    })),
  }
}

export function exportModelToSvg(
  model: DxfModel,
  opts?: { strokeWidth?: number; units?: 'mm' | 'inch'; convertToMm?: boolean },
): string {
  const convertToMm = opts?.convertToMm ?? true
  const scaled = convertToMm ? scaleModel(model, convertFactorToMm(model.sourceUnits)) : model

  const allPoints: Point[] = []
  for (const pl of scaled.polylines) allPoints.push(...pl.points)
  const bb = bboxOf(allPoints)
  const w = bb.maxX - bb.minX
  const h = bb.maxY - bb.minY
  const strokeWidth = opts?.strokeWidth ?? Math.max(Math.min(w, h) * 0.001, 0.2)
  const viewBox = `${bb.minX} ${-bb.maxY} ${w} ${h}`
  const unit = (opts?.units ?? (convertToMm ? 'mm' : model.sourceUnits === 'inch' ? 'inch' : 'mm')) === 'inch' ? 'in' : 'mm'
  const widthAttr = Number.isFinite(w) && w > 0 ? `${roundTo(w, 3)}${unit}` : undefined
  const heightAttr = Number.isFinite(h) && h > 0 ? `${roundTo(h, 3)}${unit}` : undefined

  const paths = scaled.polylines
    .map((pl) => {
      const d = polylineToSvgPath(pl)
      if (!d) return ''
      return `<path d="${d}" fill="none" stroke="black" stroke-width="${strokeWidth}" />`
    })
    .filter(Boolean)
    .join('\n')

  const sizeAttrs = [widthAttr ? `width="${widthAttr}"` : '', heightAttr ? `height="${heightAttr}"` : ''].filter(Boolean).join(' ')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" ${sizeAttrs} viewBox="${viewBox}">\n${paths}\n</svg>\n`
}

function dxfHeader(insUnits: number | null): string {
  return [
    '0',
    'SECTION',
    '2',
    'HEADER',
    ...(insUnits !== null
      ? [
          '9',
          '$INSUNITS',
          '70',
          String(insUnits),
          '9',
          '$MEASUREMENT',
          '70',
          String(insUnits === 1 ? 0 : 1),
        ]
      : []),
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

export function exportModelToDxf(model: DxfModel, opts?: { units?: 'mm' | 'inch'; convertToMm?: boolean }): string {
  const convertToMm = opts?.convertToMm ?? true
  const targetUnits: 'mm' | 'inch' = opts?.units ?? 'mm'
  const factor = convertToMm ? convertFactorToMm(model.sourceUnits) : 1
  const scaled = scaleModel(model, factor)
  const insUnits = insUnitsCode(targetUnits)

  const entities: string[] = []
  for (const pl of scaled.polylines) {
    if (pl.points.length < 2) continue
    entities.push(writeLwPolyline(pl, pl.layer ?? '0'))
  }
  return `${dxfHeader(insUnits)}\n${entities.join('\n')}\n${dxfFooter()}\n`
}
