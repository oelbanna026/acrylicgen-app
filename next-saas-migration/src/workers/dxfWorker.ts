import { parseDxfToModel, pickLargestClosedPolyline } from '@/utils/dxfParser'
import { analyzeFingerJoints } from '@/utils/jointDetector'
import { regenerateFingerJointsRectangular } from '@/utils/jointRegenerator'
import { exportModelToDxf, exportModelToSvg } from '@/utils/exporter'
import type { DxfModel, JointAnalysis, JointSettings } from '@/utils/types'

type RequestMessage =
  | { id: string; action: 'parse'; dxfText: string }
  | { id: string; action: 'analyze'; polylineId?: string }
  | { id: string; action: 'regenerate'; settings: JointSettings }
  | { id: string; action: 'exportSvg' }
  | { id: string; action: 'exportDxf' }

type ResponseMessage =
  | { id: string; ok: true; action: string; data: any }
  | { id: string; ok: false; action: string; error: string }

let model: DxfModel | null = null
let analysis: JointAnalysis | null = null
let activePolylineId: string | null = null

function reply(message: ResponseMessage) {
  ;(self as any).postMessage(message)
}

;(self as any).onmessage = (ev: MessageEvent<RequestMessage>) => {
  const msg = ev.data
  try {
    if (msg.action === 'parse') {
      model = parseDxfToModel(msg.dxfText)
      const main = pickLargestClosedPolyline(model)
      activePolylineId = main?.id ?? null
      analysis = main ? analyzeFingerJoints(main) : null
      reply({ id: msg.id, ok: true, action: msg.action, data: { model, activePolylineId, analysis } })
      return
    }

    if (msg.action === 'analyze') {
      if (!model) throw new Error('No model loaded')
      activePolylineId = msg.polylineId ?? activePolylineId
      const pl = model.polylines.find((p) => p.id === activePolylineId) ?? pickLargestClosedPolyline(model)
      if (!pl) throw new Error('No closed polyline found')
      activePolylineId = pl.id
      analysis = analyzeFingerJoints(pl)
      reply({ id: msg.id, ok: true, action: msg.action, data: { analysis, activePolylineId } })
      return
    }

    if (msg.action === 'regenerate') {
      if (!model || !analysis || !activePolylineId) throw new Error('No analysis available')
      const idx = model.polylines.findIndex((p) => p.id === activePolylineId)
      if (idx < 0) throw new Error('Active polyline not found')
      const original = model.polylines[idx]
      const result = regenerateFingerJointsRectangular(original, analysis, msg.settings)
      const next: DxfModel = { ...model, polylines: model.polylines.slice() }
      next.polylines[idx] = result.polyline
      model = next
      analysis = analyzeFingerJoints(result.polyline)
      reply({ id: msg.id, ok: true, action: msg.action, data: { model, analysis, warnings: result.warnings } })
      return
    }

    if (msg.action === 'exportSvg') {
      if (!model) throw new Error('No model loaded')
      const svg = exportModelToSvg(model)
      reply({ id: msg.id, ok: true, action: msg.action, data: { svg } })
      return
    }

    if (msg.action === 'exportDxf') {
      if (!model) throw new Error('No model loaded')
      const dxf = exportModelToDxf(model)
      reply({ id: msg.id, ok: true, action: msg.action, data: { dxf } })
      return
    }

    throw new Error('Unknown action')
  } catch (e: any) {
    reply({ id: msg.id, ok: false, action: msg.action, error: e?.message || String(e) })
  }
}

