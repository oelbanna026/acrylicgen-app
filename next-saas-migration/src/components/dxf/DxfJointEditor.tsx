'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { DxfModel, JointAnalysis, JointSettings } from '@/utils/types'
import DxfViewer from '@/components/dxf/DxfViewer'
import { parseDxfToModel, pickLargestClosedPolyline } from '@/utils/dxfParser'
import { analyzeFingerJoints } from '@/utils/jointDetector'
import { regenerateFingerJointsRectangular } from '@/utils/jointRegenerator'
import { exportModelToDxf, exportModelToSvg } from '@/utils/exporter'

type WorkerRequest =
  | { id: string; action: 'parse'; dxfText: string }
  | { id: string; action: 'analyze'; polylineId?: string }
  | { id: string; action: 'regenerate'; settings: JointSettings }
  | { id: string; action: 'exportSvg' }
  | { id: string; action: 'exportDxf' }

type WorkerRequestWithoutId =
  | { action: 'parse'; dxfText: string }
  | { action: 'analyze'; polylineId?: string }
  | { action: 'regenerate'; settings: JointSettings }
  | { action: 'exportSvg' }
  | { action: 'exportDxf' }

type WorkerResponse =
  | { id: string; ok: true; action: string; data: any }
  | { id: string; ok: false; action: string; error: string }

type LocalState = {
  model: DxfModel | null
  analysis: JointAnalysis | null
  activePolylineId: string | null
}

function downloadText(filename: string, text: string, mime: string) {
  const blob = new Blob([text], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

function suggestTolerance(thickness: number, fit: JointSettings['fit']): number {
  let base = 0.2
  if (thickness <= 3.2) base = 0.15
  else if (thickness <= 5.2) base = 0.2
  else base = 0.3
  if (fit === 'tight') base = Math.max(0, base - 0.05)
  if (fit === 'loose') base = base + 0.05
  return Number(base.toFixed(2))
}

function makeRequestId(): string {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID()
  } catch {}
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`
}

async function withTimeout<T>(p: Promise<T>, ms: number, message: string): Promise<T> {
  let timer: any
  try {
    return await Promise.race([
      p,
      new Promise<T>((_, reject) => {
        timer = setTimeout(() => reject(new Error(message)), ms)
      }),
    ])
  } finally {
    if (timer) clearTimeout(timer)
  }
}

export default function DxfJointEditor() {
  const workerRef = useRef<Worker | null>(null)
  const pendingRef = useRef(new Map<string, (resp: WorkerResponse) => void>())
  const localRef = useRef<LocalState>({ model: null, analysis: null, activePolylineId: null })
  const canUseWorkerRef = useRef<boolean>(true)

  const [isBusy, setIsBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [model, setModel] = useState<DxfModel | null>(null)
  const [analysis, setAnalysis] = useState<JointAnalysis | null>(null)
  const [activePolylineId, setActivePolylineId] = useState<string | null>(null)
  const [warnings, setWarnings] = useState<string[]>([])

  const [fit, setFit] = useState<JointSettings['fit']>('normal')
  const [materialThickness, setMaterialThickness] = useState<number>(3)
  const [newJointWidth, setNewJointWidth] = useState<number>(10)
  const [tolerance, setTolerance] = useState<number>(0.2)

  const [undoStack, setUndoStack] = useState<string[]>([])
  const [redoStack, setRedoStack] = useState<string[]>([])

  const localHandle = useCallback(async (payload: WorkerRequestWithoutId) => {
    if (payload.action === 'parse') {
      const nextModel = parseDxfToModel(payload.dxfText)
      const main = pickLargestClosedPolyline(nextModel)
      const nextActive = main?.id ?? null
      const nextAnalysis = main ? analyzeFingerJoints(main) : null
      localRef.current = { model: nextModel, activePolylineId: nextActive, analysis: nextAnalysis }
      return { model: nextModel, activePolylineId: nextActive, analysis: nextAnalysis }
    }

    if (payload.action === 'analyze') {
      const st = localRef.current
      if (!st.model) throw new Error('No model loaded')
      const wanted = payload.polylineId ?? st.activePolylineId
      const pl =
        (wanted ? st.model.polylines.find((p) => p.id === wanted) : null) ?? pickLargestClosedPolyline(st.model)
      if (!pl) throw new Error('No closed polyline found')
      const nextAnalysis = analyzeFingerJoints(pl)
      localRef.current = { model: st.model, activePolylineId: pl.id, analysis: nextAnalysis }
      return { analysis: nextAnalysis, activePolylineId: pl.id }
    }

    if (payload.action === 'regenerate') {
      const st = localRef.current
      if (!st.model || !st.analysis || !st.activePolylineId) throw new Error('No analysis available')
      const idx = st.model.polylines.findIndex((p) => p.id === st.activePolylineId)
      if (idx < 0) throw new Error('Active polyline not found')
      const original = st.model.polylines[idx]
      const result = regenerateFingerJointsRectangular(original, st.analysis, payload.settings)
      const nextModel: DxfModel = { ...st.model, polylines: st.model.polylines.slice() }
      nextModel.polylines[idx] = result.polyline
      const nextAnalysis = analyzeFingerJoints(result.polyline)
      localRef.current = { model: nextModel, activePolylineId: st.activePolylineId, analysis: nextAnalysis }
      return { model: nextModel, analysis: nextAnalysis, warnings: result.warnings }
    }

    if (payload.action === 'exportSvg') {
      const st = localRef.current
      if (!st.model) throw new Error('No model loaded')
      return { svg: exportModelToSvg(st.model) }
    }

    if (payload.action === 'exportDxf') {
      const st = localRef.current
      if (!st.model) throw new Error('No model loaded')
      return { dxf: exportModelToDxf(st.model) }
    }

    throw new Error('Unknown action')
  }, [])

  const request = useCallback(
    async (payload: WorkerRequestWithoutId) => {
      const w = canUseWorkerRef.current ? workerRef.current : null
      if (!w) return localHandle(payload)

      const id = makeRequestId()
      const msg: WorkerRequest = { id, ...(payload as any) }

      const p = new Promise<WorkerResponse>((resolve) => {
        pendingRef.current.set(id, resolve)
      })

      try {
        w.postMessage(msg)
        const resp = await withTimeout(p, 20000, 'Worker timeout')
        if (!resp.ok) throw new Error(resp.error)
        return resp.data
      } catch (e) {
        workerRef.current = null
        pendingRef.current.delete(id)
        return localHandle(payload)
      }
    },
    [localHandle],
  )

  useEffect(() => {
    let w: Worker | null = null
    try {
      canUseWorkerRef.current = window.self === window.top
    } catch {
      canUseWorkerRef.current = false
    }
    if (!canUseWorkerRef.current) {
      workerRef.current = null
      return
    }
    try {
      w = new Worker(new URL('../../workers/dxfWorker.ts', import.meta.url), { type: 'module' } as any)
      workerRef.current = w
    } catch {
      workerRef.current = null
      return
    }

    const flushWithError = (message: string) => {
      const pending = Array.from(pendingRef.current.entries())
      pendingRef.current.clear()
      for (const [id, cb] of pending) cb({ id, ok: false, action: 'worker', error: message })
    }

    w.onmessage = (ev: MessageEvent<WorkerResponse>) => {
      const msg = ev.data
      const cb = pendingRef.current.get(msg.id)
      if (!cb) return
      pendingRef.current.delete(msg.id)
      cb(msg)
    }

    w.onerror = () => {
      workerRef.current = null
      flushWithError('Worker failed to load')
    }

    w.onmessageerror = () => {
      workerRef.current = null
      flushWithError('Worker message error')
    }

    return () => {
      w?.terminate()
      workerRef.current = null
      pendingRef.current.clear()
    }
  }, [])

  useEffect(() => {
    setTolerance(suggestTolerance(materialThickness, fit))
  }, [materialThickness, fit])

  const settings: JointSettings = useMemo(
    () => ({
      newJointWidth,
      materialThickness,
      tolerance,
      fit,
    }),
    [newJointWidth, materialThickness, tolerance, fit],
  )

  const onUpload = useCallback(
    async (file: File) => {
      setError(null)
      setWarnings([])
      setIsBusy(true)
      try {
        const text = await file.text()
        const parseResult = await request({ action: 'parse', dxfText: text })
        setModel(parseResult.model ?? null)
        setAnalysis(parseResult.analysis ?? null)
        setActivePolylineId(parseResult.activePolylineId ?? null)
        setUndoStack([text])
        setRedoStack([])

        const detectedW = parseResult.analysis?.detectedJointWidth
        const detectedD = parseResult.analysis?.detectedDepth
        if (typeof detectedW === 'number' && detectedW > 0) setNewJointWidth(Number(detectedW.toFixed(2)))
        if (typeof detectedD === 'number' && detectedD > 0) setMaterialThickness(Number(detectedD.toFixed(2)))
      } catch (e: any) {
        setError(e?.message || String(e))
      } finally {
        setIsBusy(false)
      }
    },
    [request],
  )

  const onRegenerate = useCallback(async () => {
    if (!model || !analysis) return
    setError(null)
    setWarnings([])
    setIsBusy(true)
    try {
      const resp = await request({ action: 'regenerate', settings })
      setModel(resp.model ?? null)
      setAnalysis(resp.analysis ?? null)
      setWarnings(resp.warnings ?? [])
      const nextDxf = await request({ action: 'exportDxf' })
      setUndoStack((s) => [...s, nextDxf.dxf])
      setRedoStack([])
    } catch (e: any) {
      setError(e?.message || String(e))
    } finally {
      setIsBusy(false)
    }
  }, [model, analysis, request, settings])

  const onExportSvg = useCallback(async () => {
    setError(null)
    setIsBusy(true)
    try {
      const { svg } = await request({ action: 'exportSvg' })
      downloadText('acrylicgen-updated.svg', svg, 'image/svg+xml')
    } catch (e: any) {
      setError(e?.message || String(e))
    } finally {
      setIsBusy(false)
    }
  }, [request])

  const onExportDxf = useCallback(async () => {
    setError(null)
    setIsBusy(true)
    try {
      const { dxf } = await request({ action: 'exportDxf' })
      downloadText('acrylicgen-updated.dxf', dxf, 'application/dxf')
    } catch (e: any) {
      setError(e?.message || String(e))
    } finally {
      setIsBusy(false)
    }
  }, [request])

  const onUndo = useCallback(async () => {
    if (undoStack.length <= 1) return
    setError(null)
    setIsBusy(true)
    try {
      const current = undoStack[undoStack.length - 1]
      const prev = undoStack[undoStack.length - 2]
      const parseResult = await request({ action: 'parse', dxfText: prev })
      setModel(parseResult.model ?? null)
      setAnalysis(parseResult.analysis ?? null)
      setActivePolylineId(parseResult.activePolylineId ?? null)
      setUndoStack((s) => s.slice(0, -1))
      setRedoStack((s) => [current, ...s])
    } catch (e: any) {
      setError(e?.message || String(e))
    } finally {
      setIsBusy(false)
    }
  }, [undoStack, request])

  const onRedo = useCallback(async () => {
    if (!redoStack.length) return
    setError(null)
    setIsBusy(true)
    try {
      const next = redoStack[0]
      const parseResult = await request({ action: 'parse', dxfText: next })
      setModel(parseResult.model ?? null)
      setAnalysis(parseResult.analysis ?? null)
      setActivePolylineId(parseResult.activePolylineId ?? null)
      setUndoStack((s) => [...s, next])
      setRedoStack((s) => s.slice(1))
    } catch (e: any) {
      setError(e?.message || String(e))
    } finally {
      setIsBusy(false)
    }
  }, [redoStack, request])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1 space-y-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h1 className="text-lg font-semibold text-gray-900 mb-2">DXF Finger Joints Editor</h1>
          <p className="text-sm text-gray-600">
            ارفع ملف DXF، سيحاول النظام اكتشاف التعشيقات تلقائياً، ثم يمكنك تغيير المقاس عالميًا وإعادة توليد الحدود.
          </p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
          <label className="block text-sm font-medium text-gray-700">رفع ملف DXF</label>
          <input
            type="file"
            accept=".dxf"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) void onUpload(f)
            }}
            className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
          />
          {model ? (
            <div className="text-xs text-gray-500">
              Polylines parsed: {model.polylines.length}
            </div>
          ) : null}
          {model && model.polylines.length === 0 ? (
            <div className="rounded-md bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800">
              لم يتم العثور على عناصر هندسية مدعومة داخل DXF. إذا كان الملف مبنيًا على Blocks/Inserts فجرّب رفعه مرة أخرى بعد التحديث.
            </div>
          ) : null}
          {analysis && (
            <div className="text-sm text-gray-700 space-y-1">
              <div>عدد التعشيقات المكتشفة: {analysis.totalJoints}</div>
              <div>مقاس التعشيق الحالي (تقديري): {analysis.detectedJointWidth ?? '-'} mm</div>
              <div>عمق/سُمك (تقديري): {analysis.detectedDepth ?? '-'} mm</div>
            </div>
          )}
          {analysis?.warnings?.length ? (
            <div className="rounded-md bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800 space-y-1">
              {analysis.warnings.map((w, idx) => (
                <div key={idx}>{w}</div>
              ))}
            </div>
          ) : null}
          {warnings.length ? (
            <div className="rounded-md bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800 space-y-1">
              {warnings.map((w, idx) => (
                <div key={idx}>{w}</div>
              ))}
            </div>
          ) : null}
          {error ? <div className="rounded-md bg-red-50 border border-red-200 p-3 text-xs text-red-700">{error}</div> : null}
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">New joint width (mm)</label>
              <input
                type="number"
                step="0.01"
                value={newJointWidth}
                onChange={(e) => setNewJointWidth(Number(e.target.value))}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Material thickness / depth (mm)</label>
              <input
                type="number"
                step="0.01"
                value={materialThickness}
                onChange={(e) => setMaterialThickness(Number(e.target.value))}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Tolerance / Clearance (mm)</label>
              <input
                type="number"
                step="0.01"
                value={tolerance}
                onChange={(e) => setTolerance(Number(e.target.value))}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Fit type</label>
              <select
                value={fit}
                onChange={(e) => setFit(e.target.value as any)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="tight">tight</option>
                <option value="normal">normal</option>
                <option value="loose">loose</option>
              </select>
            </div>
          </div>

          <button
            onClick={() => void onRegenerate()}
            disabled={!analysis || isBusy}
            className="w-full rounded-md bg-teal-600 text-white py-2 text-sm font-semibold disabled:opacity-50 hover:bg-teal-700"
          >
            Apply (Regenerate)
          </button>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => void onUndo()}
              disabled={undoStack.length <= 1 || isBusy}
              className="rounded-md bg-gray-100 text-gray-800 py-2 text-sm font-semibold disabled:opacity-50 hover:bg-gray-200"
            >
              Undo
            </button>
            <button
              onClick={() => void onRedo()}
              disabled={redoStack.length === 0 || isBusy}
              className="rounded-md bg-gray-100 text-gray-800 py-2 text-sm font-semibold disabled:opacity-50 hover:bg-gray-200"
            >
              Redo
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => void onExportSvg()}
              disabled={!model || isBusy}
              className="rounded-md bg-blue-600 text-white py-2 text-sm font-semibold disabled:opacity-50 hover:bg-blue-700"
            >
              Export SVG
            </button>
            <button
              onClick={() => void onExportDxf()}
              disabled={!model || isBusy}
              className="rounded-md bg-blue-600 text-white py-2 text-sm font-semibold disabled:opacity-50 hover:bg-blue-700"
            >
              Export DXF
            </button>
          </div>
        </div>
      </div>

      <div className="lg:col-span-2 space-y-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-700 flex items-center justify-between">
            <div>{isBusy ? 'Processing…' : model ? 'Preview' : 'ارفع ملف DXF للبدء'}</div>
            {activePolylineId ? <div className="text-xs text-gray-500">Polyline: {activePolylineId}</div> : null}
          </div>
        </div>
        <DxfViewer model={model} analysis={analysis} />
      </div>
    </div>
  )
}
