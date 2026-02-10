'use client'

import { useMemo } from 'react'
import type { DxfModel, JointAnalysis } from '@/utils/types'
import { bboxOf, roundTo } from '@/utils/geometry'

function polylineToPath(points: Array<{ x: number; y: number }>, closed: boolean): string {
  if (!points.length) return ''
  let d = `M ${roundTo(points[0].x, 2)} ${roundTo(-points[0].y, 2)}`
  for (let i = 1; i < points.length; i++) d += ` L ${roundTo(points[i].x, 2)} ${roundTo(-points[i].y, 2)}`
  if (closed) d += ' Z'
  return d
}

export default function DxfViewer({
  model,
  analysis,
}: {
  model: DxfModel | null
  analysis: JointAnalysis | null
}) {
  const { viewBox, paths, jointOverlays } = useMemo(() => {
    if (!model || model.polylines.length === 0) {
      return { viewBox: '0 0 100 100', paths: [] as string[], jointOverlays: [] as any[] }
    }
    const pts = model.polylines.flatMap((p) => p.points)
    const bb = bboxOf(pts)
    if (![bb.minX, bb.minY, bb.maxX, bb.maxY].every((v) => Number.isFinite(v))) {
      return { viewBox: '0 0 100 100', paths: [] as string[], jointOverlays: [] as any[] }
    }
    const rawW = bb.maxX - bb.minX
    const rawH = bb.maxY - bb.minY
    const w = Number.isFinite(rawW) && rawW > 0 ? rawW : 100
    const h = Number.isFinite(rawH) && rawH > 0 ? rawH : 100
    const pad = Math.max(w, h) * 0.02
    const vb = `${bb.minX - pad} ${-(bb.maxY + pad)} ${w + pad * 2} ${h + pad * 2}`

    const pths = model.polylines
      .map((p) => polylineToPath(p.points, p.closed))
      .filter((d) => d.length > 0)

    const overlays =
      analysis?.edges.flatMap((edge) =>
        edge.joints.map((j) => {
          const isH = edge.side === 'top' || edge.side === 'bottom'
          const w = Math.max(0.1, j.width)
          const d = Math.max(0.1, j.depth || analysis.detectedDepth || 1)
          const cx = j.position.x
          const cy = j.position.y

          if (isH) {
            const yOuter = edge.side === 'top' ? cy : cy
            const y = edge.side === 'top' ? -(yOuter - d) : -(yOuter)
            const height = d
            const x = cx - w / 2
            return { x, y, width: w, height, type: j.type, side: edge.side }
          }

          const xOuter = cx
          const x = edge.side === 'right' ? xOuter - d : xOuter
          const y = -(cy + w / 2)
          return { x, y, width: d, height: w, type: j.type, side: edge.side }
        }),
      ) ?? []

    return { viewBox: vb, paths: pths, jointOverlays: overlays }
  }, [model, analysis])

  return (
    <div className="w-full h-[70vh] bg-white rounded-lg border border-gray-200 overflow-hidden">
      <svg className="w-full h-full" viewBox={viewBox}>
        <g>
          {paths.map((d, idx) => (
            <path key={idx} d={d} fill="none" stroke="#0f172a" strokeWidth={0.3} vectorEffect="non-scaling-stroke" />
          ))}
        </g>

        {analysis && (
          <g>
            {jointOverlays.map((r, idx) => (
              <rect
                key={idx}
                x={r.x}
                y={r.y}
                width={r.width}
                height={r.height}
                fill={r.type === 'slot' ? 'rgba(239,68,68,0.25)' : 'rgba(16,185,129,0.25)'}
                stroke={r.type === 'slot' ? 'rgba(239,68,68,0.8)' : 'rgba(16,185,129,0.8)'}
                strokeWidth={0.2}
                vectorEffect="non-scaling-stroke"
              />
            ))}
          </g>
        )}
      </svg>
    </div>
  )
}
