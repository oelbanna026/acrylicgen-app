(function () {
  const $ = (id) => document.getElementById(id)
  const fileInput = $('fileInput')
  const fileBadge = $('fileBadge')
  const parseReport = $('parseReport')
  const actionReport = $('actionReport')
  const previewHost = $('previewHost')
  const statsEl = $('stats')

  const oldTEl = $('oldT')
  const newTEl = $('newT')
  const tolEl = $('tol')
  const kerfEl = $('kerf')
  const adjSlotDepthEl = $('adjSlotDepth')
  const adjSlotWidthEl = $('adjSlotWidth')
  const adjTabHeightEl = $('adjTabHeight')
  const livePreviewEl = $('livePreview')
  const autoSpaceEl = $('autoSpace')
  const includeBackupEl = $('includeBackup')

  const applyBtn = $('applyBtn')
  const okBtn = $('okBtn')
  const cancelBtn = $('cancelBtn')
  const exportSvgBtn = $('exportSvgBtn')
  const exportDxfBtn = $('exportDxfBtn')

  const state = {
    fileName: '',
    sourceType: null,
    sourceText: '',
    original: null,
    current: null,
    overlays: [],
    lastExportName: '',
  }

  function round(n, p = 4) {
    const k = Math.pow(10, p)
    return Math.round(n * k) / k
  }

  function dist(a, b) {
    const dx = a.x - b.x
    const dy = a.y - b.y
    return Math.hypot(dx, dy)
  }

  function bboxOfPoints(pts) {
    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity
    for (const p of pts) {
      if (!Number.isFinite(p.x) || !Number.isFinite(p.y)) continue
      if (p.x < minX) minX = p.x
      if (p.y < minY) minY = p.y
      if (p.x > maxX) maxX = p.x
      if (p.y > maxY) maxY = p.y
    }
    if (!Number.isFinite(minX)) return { minX: 0, minY: 0, maxX: 0, maxY: 0 }
    return { minX, minY, maxX, maxY }
  }

  function simplifyCollinear(points, eps = 1e-6) {
    if (!points || points.length < 3) return points || []
    const out = [points[0]]
    for (let i = 1; i < points.length - 1; i++) {
      const a = out[out.length - 1]
      const b = points[i]
      const c = points[i + 1]
      const abx = b.x - a.x
      const aby = b.y - a.y
      const bcx = c.x - b.x
      const bcy = c.y - b.y
      const cross = abx * bcy - aby * bcx
      if (Math.abs(cross) <= eps && (Math.abs(abx) <= eps || Math.abs(aby) <= eps) && (Math.abs(bcx) <= eps || Math.abs(bcy) <= eps)) {
        continue
      }
      out.push(b)
    }
    out.push(points[points.length - 1])
    return out
  }

  function isAxisAligned(a, b, eps) {
    return Math.abs(a.x - b.x) <= eps || Math.abs(a.y - b.y) <= eps
  }

  function segmentsOfPolyline(pl, eps) {
    const pts = pl.points
    const segs = []
    const limit = pl.closed ? pts.length : pts.length - 1
    for (let i = 0; i < limit; i++) {
      const a = pts[i]
      const b = pts[(i + 1) % pts.length]
      const dx = b.x - a.x
      const dy = b.y - a.y
      const len = Math.hypot(dx, dy)
      if (!Number.isFinite(len) || len <= eps) continue
      segs.push({ a, b, dx, dy, len, i })
    }
    return segs
  }

  function downloadText(filename, text) {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  function parseNumberLike(s) {
    const n = Number(String(s).trim())
    return Number.isFinite(n) ? n : null
  }

  function parseSvgLengthToPx(s) {
    if (!s) return null
    const m = String(s).trim().match(/^([+-]?\d*\.?\d+)\s*(mm|cm|in|px)?$/i)
    if (!m) return null
    const v = Number(m[1])
    const u = (m[2] || 'px').toLowerCase()
    if (!Number.isFinite(v)) return null
    if (u === 'px') return v
    if (u === 'mm') return v * (96 / 25.4)
    if (u === 'cm') return v * (96 / 2.54)
    if (u === 'in') return v * 96
    return v
  }

  function parseSvgToModel(svgText) {
    const parser = new DOMParser()
    const doc = parser.parseFromString(svgText, 'image/svg+xml')
    const svg = doc.querySelector('svg')
    if (!svg) throw new Error('Invalid SVG')
    const viewBox = svg.getAttribute('viewBox')
    const widthAttr = svg.getAttribute('width')
    const heightAttr = svg.getAttribute('height')
    let vb = null
    if (viewBox) {
      const parts = viewBox.trim().split(/[\s,]+/).map((x) => Number(x))
      if (parts.length === 4 && parts.every((n) => Number.isFinite(n))) vb = { x: parts[0], y: parts[1], w: parts[2], h: parts[3] }
    }
    const wPx = parseSvgLengthToPx(widthAttr)
    const hPx = parseSvgLengthToPx(heightAttr)
    let pxToMm = 1
    if (wPx && hPx && vb && vb.w > 0 && vb.h > 0) {
      const mmPerPx = 25.4 / 96
      const pxPerVbX = wPx / vb.w
      pxToMm = (1 / pxPerVbX) * mmPerPx
    }

    const polylines = []
    const ignored = []

    const pushPolyline = (pts, closed) => {
      if (!pts || pts.length < 2) return
      const points = pts.map((p) => ({ x: p.x * pxToMm, y: p.y * pxToMm }))
      const clean = simplifyCollinear(points, 1e-6)
      if (clean.length < 2) return
      polylines.push({ id: `pl_${polylines.length}`, closed: Boolean(closed), points: clean })
    }

    const parsePointsAttr = (attr) => {
      const nums = String(attr || '')
        .trim()
        .split(/[\s,]+/)
        .map((x) => Number(x))
        .filter((n) => Number.isFinite(n))
      const pts = []
      for (let i = 0; i + 1 < nums.length; i += 2) pts.push({ x: nums[i], y: nums[i + 1] })
      return pts
    }

    for (const el of Array.from(svg.querySelectorAll('polyline'))) {
      const pts = parsePointsAttr(el.getAttribute('points'))
      pushPolyline(pts, false)
    }
    for (const el of Array.from(svg.querySelectorAll('polygon'))) {
      const pts = parsePointsAttr(el.getAttribute('points'))
      if (pts.length) pts.push({ ...pts[0] })
      pushPolyline(pts, true)
    }
    for (const el of Array.from(svg.querySelectorAll('path'))) {
      const d = el.getAttribute('d') || ''
      const res = parseSvgPathToPoints(d)
      if (res.unsupported) {
        ignored.push('path: contains curves')
        continue
      }
      pushPolyline(res.points, res.closed)
    }

    return { units: 'mm', polylines, ignored }
  }

  function parseSvgPathToPoints(d) {
    const tokens = String(d)
      .replace(/([a-zA-Z])/g, ' $1 ')
      .trim()
      .split(/[\s,]+/)
      .filter(Boolean)
    let i = 0
    let cmd = ''
    let x = 0,
      y = 0
    let startX = 0,
      startY = 0
    const pts = []
    let closed = false
    const readNum = () => {
      if (i >= tokens.length) return null
      const n = parseNumberLike(tokens[i++])
      return n
    }
    const isCmd = (t) => /^[a-zA-Z]$/.test(t)
    while (i < tokens.length) {
      const t = tokens[i]
      if (isCmd(t)) {
        cmd = t
        i++
      }
      if (!cmd) break
      const lower = cmd.toLowerCase()
      const rel = cmd !== lower
      if (lower === 'z') {
        closed = true
        pts.push({ x: startX, y: startY })
        cmd = ''
        continue
      }
      if (['c', 's', 'q', 't', 'a'].includes(lower)) return { points: [], closed: false, unsupported: true }

      if (lower === 'm' || lower === 'l') {
        const nx = readNum()
        const ny = readNum()
        if (nx === null || ny === null) break
        x = rel ? x + nx : nx
        y = rel ? y + ny : ny
        if (lower === 'm') {
          startX = x
          startY = y
        }
        pts.push({ x, y })
        if (lower === 'm') cmd = cmd === 'm' ? 'l' : 'L'
        continue
      }
      if (lower === 'h') {
        const nx = readNum()
        if (nx === null) break
        x = rel ? x + nx : nx
        pts.push({ x, y })
        continue
      }
      if (lower === 'v') {
        const ny = readNum()
        if (ny === null) break
        y = rel ? y + ny : ny
        pts.push({ x, y })
        continue
      }
      return { points: [], closed: false, unsupported: true }
    }
    return { points: pts, closed, unsupported: false }
  }

  function parseDxfToModel(dxfText) {
    const lines = String(dxfText).replace(/\r\n/g, '\n').split('\n')
    let idx = 0
    const nextPair = () => {
      if (idx + 1 >= lines.length) return null
      const code = Number(lines[idx++].trim())
      const value = lines[idx++]
      if (!Number.isFinite(code)) return null
      return { code, value: value == null ? '' : String(value) }
    }

    let insUnits = null
    const polylines = []
    const ignored = []

    let inHeader = false
    let inEntities = false
    let lastVar = null

    const readEntity = (type) => {
      const ent = { type, layer: '0', points: [], closed: false, start: null, end: null, vertexCount: null }
      while (true) {
        const p = nextPair()
        if (!p) break
        if (p.code === 0) {
          idx -= 2
          break
        }
        if (p.code === 8) ent.layer = String(p.value).trim()
        if (type === 'LINE') {
          if (p.code === 10) ent.start = ent.start || { x: 0, y: 0 }, (ent.start.x = Number(p.value))
          if (p.code === 20) ent.start = ent.start || { x: 0, y: 0 }, (ent.start.y = Number(p.value))
          if (p.code === 11) ent.end = ent.end || { x: 0, y: 0 }, (ent.end.x = Number(p.value))
          if (p.code === 21) ent.end = ent.end || { x: 0, y: 0 }, (ent.end.y = Number(p.value))
        } else if (type === 'LWPOLYLINE') {
          if (p.code === 90) ent.vertexCount = Number(p.value)
          if (p.code === 70) ent.closed = Number(p.value) === 1
          if (p.code === 10) ent.points.push({ x: Number(p.value), y: 0 })
          if (p.code === 20 && ent.points.length) ent.points[ent.points.length - 1].y = Number(p.value)
        } else if (type === 'SPLINE') {
          if (p.code === 70) ent.closed = (Number(p.value) & 1) === 1
          if (p.code === 10) ent.points.push({ x: Number(p.value), y: 0 })
          if (p.code === 20 && ent.points.length) ent.points[ent.points.length - 1].y = Number(p.value)
        }
      }
      return ent
    }

    const readPairsUntilNextEntity = () => {
      while (true) {
        const p = nextPair()
        if (!p) return null
        if (p.code === 0) return String(p.value).trim()
      }
    }

    const readVertex = () => {
      const v = { x: null, y: null }
      while (true) {
        const p = nextPair()
        if (!p) return { vertex: null, nextType: null }
        if (p.code === 0) return { vertex: v.x !== null && v.y !== null ? { x: Number(v.x), y: Number(v.y) } : null, nextType: String(p.value).trim() }
        if (p.code === 10) v.x = Number(p.value)
        if (p.code === 20) v.y = Number(p.value)
      }
    }

    const readPolyline = () => {
      const pl = { layer: '0', closed: false, points: [] }
      while (true) {
        const p = nextPair()
        if (!p) return pl
        if (p.code === 0) {
          const first = String(p.value).trim()
          let nextType = first
          while (nextType === 'VERTEX') {
            const res = readVertex()
            if (res.vertex) pl.points.push(res.vertex)
            nextType = res.nextType || ''
          }
          if (nextType === 'SEQEND') {
            const nt = readPairsUntilNextEntity()
            if (nt) {
              idx -= 2
            }
          } else if (nextType) {
            idx -= 2
          }
          return pl
        }
        if (p.code === 8) pl.layer = String(p.value).trim()
        if (p.code === 70) pl.closed = (Number(p.value) & 1) === 1
      }
    }

    while (true) {
      const p = nextPair()
      if (!p) break
      if (p.code === 0 && String(p.value).trim() === 'SECTION') {
        const t = nextPair()
        if (t && t.code === 2) {
          const name = String(t.value).trim()
          inHeader = name === 'HEADER'
          inEntities = name === 'ENTITIES'
        }
        continue
      }
      if (p.code === 0 && String(p.value).trim() === 'ENDSEC') {
        inHeader = false
        inEntities = false
        continue
      }

      if (inHeader) {
        if (p.code === 9) lastVar = String(p.value).trim()
        if (lastVar === '$INSUNITS' && p.code === 70) insUnits = Number(p.value)
        continue
      }

      if (inEntities && p.code === 0) {
        const type = String(p.value).trim()
        if (type === 'LINE' || type === 'LWPOLYLINE' || type === 'SPLINE') {
          const ent = readEntity(type)
          if (type === 'LINE' && ent.start && ent.end) {
            polylines.push({ id: `pl_${polylines.length}`, closed: false, layer: ent.layer, points: [ent.start, ent.end] })
          }
          if (type === 'LWPOLYLINE' && ent.points.length >= 2) {
            const pts = ent.closed ? ent.points.concat([ent.points[0]]) : ent.points
            polylines.push({ id: `pl_${polylines.length}`, closed: Boolean(ent.closed), layer: ent.layer, points: simplifyCollinear(pts, 1e-6) })
          }
          if (type === 'SPLINE' && ent.points.length >= 2) {
            const pts = ent.closed ? ent.points.concat([ent.points[0]]) : ent.points
            const clean = simplifyCollinear(pts, 1e-6)
            const closed = Boolean(ent.closed) || (clean.length >= 3 && dist(clean[0], clean[clean.length - 1]) <= 1e-3)
            polylines.push({ id: `pl_${polylines.length}`, closed, layer: ent.layer, points: clean })
          }
        } else if (type === 'POLYLINE') {
          const ent = readPolyline()
          if (ent.points.length >= 2) {
            const pts = ent.closed ? ent.points.concat([ent.points[0]]) : ent.points
            polylines.push({ id: `pl_${polylines.length}`, closed: Boolean(ent.closed), layer: ent.layer, points: simplifyCollinear(pts, 1e-6) })
          }
        } else {
          if (type && type !== 'EOF') ignored.push(type)
        }
      }
    }

    let factor = 1
    if (insUnits === 1) factor = 25.4
    const scaled = polylines.map((pl) => ({
      ...pl,
      points: pl.points.map((p) => ({ x: p.x * factor, y: p.y * factor })),
    }))

    return { units: 'mm', polylines: scaled, ignored }
  }

  function modelToSvg(model, opts) {
    const keepOriginal = opts?.keepOriginal ?? true
    const precision = 3
    const all = []
    for (const pl of model.polylines) all.push(...pl.points)
    const bb = bboxOfPoints(all)
    const w = bb.maxX - bb.minX || 100
    const h = bb.maxY - bb.minY || 100
    const pad = Math.max(w, h) * 0.02
    const vb = `${bb.minX - pad} ${bb.minY - pad} ${w + pad * 2} ${h + pad * 2}`
    const stroke = Math.max(Math.min(w, h) * 0.001, 0.2)
    const plToPath = (pl) => {
      const pts = pl.points
      if (!pts.length) return ''
      let d = `M ${round(pts[0].x, precision)} ${round(pts[0].y, precision)}`
      for (let i = 1; i < pts.length; i++) d += ` L ${round(pts[i].x, precision)} ${round(pts[i].y, precision)}`
      if (pl.closed) d += ' Z'
      return d
    }
    const originalGroup = keepOriginal && model.originalPolylines
      ? `<g id="original" opacity="0.35" style="display:none">\n${model.originalPolylines
          .map((pl) => `<path d="${plToPath(pl)}" fill="none" stroke="#6b7280" stroke-width="${stroke}" />`)
          .join('\n')}\n</g>\n`
      : ''
    const resizedGroup = `<g id="resized">\n${model.polylines
      .map((pl) => `<path d="${plToPath(pl)}" fill="none" stroke="#111827" stroke-width="${stroke}" />`)
      .join('\n')}\n</g>\n`
    const overlays = (opts?.overlays || [])
      .map((o) => `<rect x="${round(o.x, 3)}" y="${round(o.y, 3)}" width="${round(o.w, 3)}" height="${round(o.h, 3)}" fill="${o.fill}" stroke="${o.stroke}" stroke-width="${stroke}" opacity="0.35" />`)
      .join('\n')
    const overlayGroup = overlays ? `<g id="overlays">${overlays}</g>\n` : ''
    return `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="${round(w, 3)}mm" height="${round(h, 3)}mm" viewBox="${vb}">\n${originalGroup}${resizedGroup}${overlayGroup}</svg>\n`
  }

  function modelToDxf(model, opts) {
    const keepOriginal = opts?.keepOriginal ?? true
    const writeLwPolyline = (pl, layer) => {
      const pts = pl.points
      const out = []
      out.push('0', 'LWPOLYLINE')
      out.push('8', layer)
      out.push('90', String(pts.length))
      out.push('70', pl.closed ? '1' : '0')
      for (const p of pts) {
        out.push('10', String(round(p.x, 4)))
        out.push('20', String(round(p.y, 4)))
      }
      return out.join('\n')
    }
    const entities = []
    if (keepOriginal && model.originalPolylines) {
      for (const pl of model.originalPolylines) if (pl.points.length >= 2) entities.push(writeLwPolyline(pl, 'ORIGINAL'))
    }
    for (const pl of model.polylines) if (pl.points.length >= 2) entities.push(writeLwPolyline(pl, 'RESIZED'))
    const header = ['0', 'SECTION', '2', 'HEADER', '9', '$INSUNITS', '70', '4', '9', '$MEASUREMENT', '70', '1', '0', 'ENDSEC', '0', 'SECTION', '2', 'ENTITIES'].join('\n')
    const footer = ['0', 'ENDSEC', '0', 'EOF'].join('\n')
    return `${header}\n${entities.join('\n')}\n${footer}\n`
  }

  function deepCloneModel(model) {
    return {
      units: model.units,
      polylines: model.polylines.map((pl) => ({
        id: pl.id,
        closed: pl.closed,
        layer: pl.layer,
        points: pl.points.map((p) => ({ x: p.x, y: p.y })),
      })),
      ignored: (model.ignored || []).slice(),
    }
  }

  function unionFind(n) {
    const parent = new Array(n).fill(0).map((_, i) => i)
    const rank = new Array(n).fill(0)
    const find = (x) => {
      while (parent[x] !== x) {
        parent[x] = parent[parent[x]]
        x = parent[x]
      }
      return x
    }
    const union = (a, b) => {
      let ra = find(a)
      let rb = find(b)
      if (ra === rb) return
      if (rank[ra] < rank[rb]) {
        parent[ra] = rb
      } else if (rank[ra] > rank[rb]) {
        parent[rb] = ra
      } else {
        parent[rb] = ra
        rank[ra]++
      }
    }
    return { find, union }
  }

  function bboxesTouch(bb1, bb2, eps) {
    return !(bb2.minX > bb1.maxX + eps || bb2.maxX < bb1.minX - eps || bb2.minY > bb1.maxY + eps || bb2.maxY < bb1.minY - eps)
  }

  function shiftPolyline(pl, dx, dy) {
    if (!dx && !dy) return pl
    return { ...pl, points: pl.points.map((p) => ({ x: p.x + dx, y: p.y + dy })) }
  }

  function autoSpaceParts(polylines, minGap) {
    const n = polylines.length
    if (n <= 1) return { polylines, movedGroups: 0, totalShift: 0 }

    const items = polylines.map((pl, i) => ({ i, pl, bb: bboxOfPoints(pl.points) }))
    const dxByIndex = new Array(n).fill(0)
    const dyByIndex = new Array(n).fill(0)
    let movedGroups = 0
    let totalShift = 0

    const passX = () => {
      items.sort((a, b) => a.bb.minX - b.bb.minX)
      let cursorMaxX = null
      for (const it of items) {
        if (cursorMaxX === null) {
          cursorMaxX = it.bb.maxX
          continue
        }
        const dx = cursorMaxX + minGap - it.bb.minX
        if (dx > 0) {
          movedGroups++
          totalShift += dx
          dxByIndex[it.i] += dx
          it.bb.minX += dx
          it.bb.maxX += dx
        }
        cursorMaxX = Math.max(cursorMaxX, it.bb.maxX)
      }
    }

    const passY = () => {
      items.sort((a, b) => a.bb.minY - b.bb.minY)
      let cursorMaxY = null
      for (const it of items) {
        if (cursorMaxY === null) {
          cursorMaxY = it.bb.maxY
          continue
        }
        const dy = cursorMaxY + minGap - it.bb.minY
        if (dy > 0) {
          movedGroups++
          totalShift += dy
          dyByIndex[it.i] += dy
          it.bb.minY += dy
          it.bb.maxY += dy
        }
        cursorMaxY = Math.max(cursorMaxY, it.bb.maxY)
      }
    }

    passX()
    passY()

    const out = polylines.map((pl, i) => {
      const dx = dxByIndex[i]
      const dy = dyByIndex[i]
      return dx || dy ? shiftPolyline(pl, dx, dy) : pl
    })
    return { polylines: out, movedGroups, totalShift }
  }

  function detectAndResize(model, settings) {
    const oldT = settings.oldT
    const newT = settings.newT
    const tol = settings.tol
    const kerf = settings.kerf
    const fit = settings.fit
    const adjSlotDepth = settings.adjSlotDepth
    const adjSlotWidth = settings.adjSlotWidth
    const adjTabHeight = settings.adjTabHeight
    const autoSpace = settings.autoSpace

    const epsBase = Math.max(Math.abs(oldT) * 1e-4, 1e-4)

    const overlays = []
    let totalFeatures = 0

    const next = deepCloneModel(model)
    next.originalPolylines = deepCloneModel(model).polylines

    const resizePolyline = (pl) => {
      const pts = pl.points
      if (pts.length < 4) return pl
      const bb = bboxOfPoints(pts)
      const eps = Math.max((bb.maxX - bb.minX + bb.maxY - bb.minY) * 1e-6, epsBase)
      const segs = segmentsOfPolyline(pl, eps)
      if (!segs.length) return pl
      const bad = segs.some((s) => !isAxisAligned(s.a, s.b, eps))
      if (bad) return pl

      const newPts = pts.map((p) => ({ x: p.x, y: p.y }))

      const midX = (bb.minX + bb.maxX) / 2
      const midY = (bb.minY + bb.maxY) / 2
      const near = (a, b) => Math.abs(a - b) <= tol + eps

      const orient = (s) => (Math.abs(s.dy) <= eps ? 'H' : Math.abs(s.dx) <= eps ? 'V' : 'N')
      const coordOf = (s) => (orient(s) === 'H' ? s.a.y : s.a.x)

      const setSegCoord = (seg, axis, val) => {
        const i0 = seg.i
        const i1 = (seg.i + 1) % newPts.length
        if (axis === 'x') {
          newPts[i0].x = val
          newPts[i1].x = val
        } else {
          newPts[i0].y = val
          newPts[i1].y = val
        }
      }

      const markRect = (bb2, kind) => {
        overlays.push({
          x: bb2.minX,
          y: bb2.minY,
          w: bb2.maxX - bb2.minX,
          h: bb2.maxY - bb2.minY,
          fill: kind === 'slot' ? 'rgba(239,68,68,0.28)' : 'rgba(16,185,129,0.28)',
          stroke: kind === 'slot' ? 'rgba(239,68,68,0.9)' : 'rgba(16,185,129,0.9)',
        })
      }

      const n = segs.length
      const sAt = (k) => segs[(k + n) % n]

      for (let i = 0; i < n; i++) {
        const s0 = sAt(i)
        const s1 = sAt(i + 1)
        const s2 = sAt(i + 2)
        const s3 = sAt(i + 3)
        const s4 = sAt(i + 4)

        const o0 = orient(s0)
        const o1 = orient(s1)
        const o2 = orient(s2)
        const o3 = orient(s3)
        const o4 = orient(s4)

        const isHVHVH = o0 === 'H' && o1 === 'V' && o2 === 'H' && o3 === 'V' && o4 === 'H'
        const isVHVHV = o0 === 'V' && o1 === 'H' && o2 === 'V' && o3 === 'H' && o4 === 'V'
        if (!isHVHVH && !isVHVHV) continue

        const shortOk = near(s1.len, oldT) && near(s3.len, oldT)
        if (!shortOk) continue

        const c0 = coordOf(s0)
        const c2 = coordOf(s2)
        const c4 = coordOf(s4)
        if (!near(c0, c4)) continue
        if (!near(Math.abs(c2 - c0), oldT)) continue

        const axis = isHVHVH ? 'y' : 'x'
        const dToEdge = (c) => {
          if (axis === 'y') return Math.min(Math.abs(c - bb.minY), Math.abs(c - bb.maxY))
          return Math.min(Math.abs(c - bb.minX), Math.abs(c - bb.maxX))
        }
        const d0 = dToEdge(c0)
        const d2 = dToEdge(c2)
        const outerIsC0 = d0 <= d2
        const kind = outerIsC0 ? 'slot' : 'tab'
        const outerCoord = outerIsC0 ? c0 : c2
        const innerCoord = outerIsC0 ? c2 : c0
        const signOut = Math.sign(outerCoord - innerCoord || 1)

        if (kind === 'slot' && adjSlotDepth) {
          const innerNew = outerCoord - signOut * newT
          setSegCoord(s2, axis, innerNew)
          totalFeatures++
          const bb2 = bboxOfPoints([s0.a, s0.b, s1.b, s2.b, s3.b])
          markRect(bb2, 'slot')
        }

        if (kind === 'tab' && adjTabHeight) {
          const outerNew = innerCoord + signOut * newT
          setSegCoord(s2, axis, outerNew)
          totalFeatures++
          const bb2 = bboxOfPoints([s0.a, s0.b, s1.b, s2.b, s3.b])
          markRect(bb2, 'tab')
        }
      }

      if (adjSlotWidth) {
        const target = Math.max(0.01, newT + (fit === 'tight' ? -tol : fit === 'loose' ? tol : 0))
        for (let i = 0; i < n; i++) {
          const s0 = sAt(i)
          const s1 = sAt(i + 1)
          const s2 = sAt(i + 2)
          const s3 = sAt(i + 3)
          const o0 = orient(s0)
          const o1 = orient(s1)
          const o2 = orient(s2)
          const o3 = orient(s3)
          const isRect = (o0 === 'H' && o1 === 'V' && o2 === 'H' && o3 === 'V') || (o0 === 'V' && o1 === 'H' && o2 === 'V' && o3 === 'H')
          if (!isRect) continue
          const bb2 = bboxOfPoints([s0.a, s0.b, s1.b, s2.b])
          const w = bb2.maxX - bb2.minX
          const h = bb2.maxY - bb2.minY
          if (!(w > eps && h > eps)) continue
          const shortIsW = Math.abs(w - oldT) <= tol + eps
          const shortIsH = Math.abs(h - oldT) <= tol + eps
          if (!shortIsW && !shortIsH) continue
          if (shortIsW) {
            const cx = (bb2.minX + bb2.maxX) / 2
            const minXNew = cx - target / 2
            const maxXNew = cx + target / 2
            for (const seg of [s0, s1, s2, s3]) {
              const ax = orient(seg) === 'V' ? 'x' : null
              if (ax) {
                const x0 = seg.a.x
                if (near(x0, bb2.minX)) setSegCoord(seg, 'x', minXNew)
                if (near(x0, bb2.maxX)) setSegCoord(seg, 'x', maxXNew)
              }
            }
            totalFeatures++
            markRect(bb2, 'slot')
          }
          if (shortIsH) {
            const cy = (bb2.minY + bb2.maxY) / 2
            const minYNew = cy - target / 2
            const maxYNew = cy + target / 2
            for (const seg of [s0, s1, s2, s3]) {
              const ay = orient(seg) === 'H' ? 'y' : null
              if (ay) {
                const y0 = seg.a.y
                if (near(y0, bb2.minY)) setSegCoord(seg, 'y', minYNew)
                if (near(y0, bb2.maxY)) setSegCoord(seg, 'y', maxYNew)
              }
            }
            totalFeatures++
            markRect(bb2, 'slot')
          }
        }
      }

      const clean = simplifyCollinear(newPts, eps)
      const closed = pl.closed || (clean.length >= 3 && dist(clean[0], clean[clean.length - 1]) <= tol + eps)
      return { ...pl, closed, points: clean }
    }

    for (let i = 0; i < next.polylines.length; i++) {
      const pl = next.polylines[i]
      if (!pl.closed) continue
      next.polylines[i] = resizePolyline(pl)
    }

    let spacing = { movedGroups: 0, totalShift: 0 }
    if (autoSpace) {
      const minGap = Math.max(0, newT)
      if (minGap > 1e-6) {
        const res = autoSpaceParts(next.polylines, minGap)
        next.polylines = res.polylines
        spacing = { movedGroups: res.movedGroups, totalShift: res.totalShift }
      }
    }

    return { model: next, overlays, totalFeatures, spacing }
  }

  function renderPreview(svgText) {
    previewHost.innerHTML = ''
    const wrap = document.createElement('div')
    wrap.className = 'w-full h-full'
    wrap.innerHTML = svgText
    const svg = wrap.querySelector('svg')
    if (svg) {
      svg.style.width = '100%'
      svg.style.height = '100%'
    }
    previewHost.appendChild(wrap)
  }

  function updateStats() {
    const m = state.current
    if (!m) {
      statsEl.textContent = ''
      return
    }
    const pts = []
    for (const pl of m.polylines) pts.push(...pl.points)
    const bb = bboxOfPoints(pts)
    const w = round(bb.maxX - bb.minX, 2)
    const h = round(bb.maxY - bb.minY, 2)
    statsEl.textContent = `${m.polylines.length} paths | ${w}×${h} mm`
  }

  function setActionReport(text, isError) {
    actionReport.textContent = text || ''
    actionReport.className = `text-xs ${isError ? 'text-red-300' : 'text-slate-300'}`
  }

  function setParseReport(text, isError) {
    parseReport.textContent = text || ''
    parseReport.className = `text-xs ${isError ? 'text-red-300' : 'text-slate-300'}`
  }

  function readSettings() {
    const oldT = Number(oldTEl.value)
    const newT = Number(newTEl.value)
    const tol = Number(tolEl.value)
    const kerf = Number(kerfEl.value)
    if (!Number.isFinite(oldT) || oldT <= 0) throw new Error('Old thickness must be > 0')
    if (!Number.isFinite(newT) || newT <= 0) throw new Error('New thickness must be > 0')
    if (!Number.isFinite(tol) || tol < 0) throw new Error('Tolerance must be >= 0')
    if (!Number.isFinite(kerf) || kerf < 0) throw new Error('Kerf must be >= 0')
    return {
      oldT,
      newT,
      tol,
      kerf,
      fit: 'normal',
      adjSlotDepth: Boolean(adjSlotDepthEl.checked),
      adjSlotWidth: Boolean(adjSlotWidthEl.checked),
      adjTabHeight: Boolean(adjTabHeightEl.checked),
      autoSpace: Boolean(autoSpaceEl?.checked),
      includeBackup: Boolean(includeBackupEl?.checked),
    }
  }

  function canWork() {
    return Boolean(state.original && state.current)
  }

  function updateButtons() {
    const ok = canWork()
    applyBtn.disabled = !ok
    okBtn.disabled = !ok
    exportSvgBtn.disabled = !ok
    exportDxfBtn.disabled = !ok
  }

  function applyResize(previewOnly) {
    if (!state.original) return
    try {
      const settings = readSettings()
      const res = detectAndResize(state.original, settings)
      state.current = res.model
      state.overlays = res.overlays
      const svg = modelToSvg(state.current, { keepOriginal: Boolean(settings.includeBackup), overlays: livePreviewEl.checked ? state.overlays : [] })
      renderPreview(svg)
      updateStats()
      const spaced = res.spacing && res.spacing.movedGroups ? ` | تم إبعاد ${res.spacing.movedGroups} مجموعات` : ''
      setActionReport(`تم الكشف: ${res.totalFeatures} مناطق محتملة للتعشيقات/الشقوق.${spaced}`, false)
      updateButtons()
    } catch (e) {
      setActionReport(e?.message || String(e), true)
    }
  }

  function resetToOriginal() {
    if (!state.original) return
    state.current = deepCloneModel(state.original)
    state.current.originalPolylines = deepCloneModel(state.original).polylines
    state.overlays = []
    const svg = modelToSvg(state.current, { keepOriginal: true, overlays: [] })
    renderPreview(svg)
    updateStats()
    setActionReport('تم الإلغاء وإرجاع المعاينة للأصل.', false)
    updateButtons()
  }

  function exportSvg() {
    if (!state.current) return
    const name = (state.fileName || 'resized').replace(/\.(svg|dxf)$/i, '')
    const keepOriginal = Boolean(includeBackupEl?.checked)
    const svg = modelToSvg(state.current, { keepOriginal, overlays: [] })
    downloadText(`${name}.resized.svg`, svg)
  }

  function exportDxf() {
    if (!state.current) return
    const name = (state.fileName || 'resized').replace(/\.(svg|dxf)$/i, '')
    const keepOriginal = Boolean(includeBackupEl?.checked)
    const dxf = modelToDxf(state.current, { keepOriginal })
    downloadText(`${name}.resized.dxf`, dxf)
  }

  fileInput.addEventListener('change', async () => {
    const f = fileInput.files && fileInput.files[0]
    if (!f) return
    const name = f.name || ''
    state.fileName = name
    fileBadge.textContent = name
    try {
      const text = await f.text()
      state.sourceText = text
      const ext = name.toLowerCase().endsWith('.dxf') ? 'dxf' : name.toLowerCase().endsWith('.svg') ? 'svg' : null
      if (!ext) throw new Error('Unsupported file type')
      state.sourceType = ext
      const model = ext === 'dxf' ? parseDxfToModel(text) : parseSvgToModel(text)
      state.original = model
      state.current = deepCloneModel(model)
      state.current.originalPolylines = deepCloneModel(model).polylines
      setParseReport(`تم التحميل: ${model.polylines.length} مسارات. تجاهل: ${model.ignored?.length || 0}`, false)
      const svg = modelToSvg(state.current, { keepOriginal: true, overlays: [] })
      renderPreview(svg)
      updateStats()
      setActionReport('', false)
      updateButtons()
      if (livePreviewEl.checked) applyResize(true)
    } catch (e) {
      state.original = null
      state.current = null
      setParseReport(e?.message || String(e), true)
      updateButtons()
    }
  })

  applyBtn.addEventListener('click', () => applyResize(false))
  okBtn.addEventListener('click', () => {
    applyResize(false)
    if (state.sourceType === 'svg') exportSvg()
    else exportDxf()
  })
  cancelBtn.addEventListener('click', () => resetToOriginal())
  exportSvgBtn.addEventListener('click', () => exportSvg())
  exportDxfBtn.addEventListener('click', () => exportDxf())

  for (const el of [oldTEl, newTEl, tolEl, kerfEl, adjSlotDepthEl, adjSlotWidthEl, adjTabHeightEl, livePreviewEl, autoSpaceEl, includeBackupEl]) {
    el.addEventListener('input', () => {
      if (!state.original) return
      if (!livePreviewEl.checked) return
      applyResize(true)
    })
    el.addEventListener('change', () => {
      if (!state.original) return
      if (!livePreviewEl.checked) return
      applyResize(true)
    })
  }

  updateButtons()
})()
