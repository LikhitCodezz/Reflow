// Geometry engine: shape representations, sampling, and scanline interval calculation.

export type ShapeType = 'circle' | 'ellipse' | 'rectangle' | 'polygon' | 'organic'

export interface Point {
  x: number
  y: number
}

export interface Shape {
  id: string
  type: ShapeType
  cx: number
  cy: number
  rotation: number // radians
  padding: number
  baseSize?: number
  // circle
  radius?: number
  // ellipse
  rx?: number
  ry?: number
  // rectangle
  width?: number
  height?: number
  cornerRadius?: number
  // polygon
  vertices?: Point[]
  scale?: number
  // organic
  baseRadius?: number
  points?: number
  noiseAmp?: number
  noiseFreq?: number
  phase?: number
  // appearance
  fill?: string
  stroke?: string
  image?: string
}

export function rotatePoint(p: Point, cx: number, cy: number, ang: number): Point {
  const c = Math.cos(ang), s = Math.sin(ang)
  const dx = p.x - cx, dy = p.y - cy
  return { x: cx + dx * c - dy * s, y: cy + dx * s + dy * c }
}

// Sample a shape into a polygon (world coords)
export function samplePolygon(shape: Shape, segments = 48): Point[] {
  const { cx, cy, rotation } = shape
  let pts: Point[] = []
  switch (shape.type) {
    case 'circle': {
      const r = shape.radius ?? 40
      for (let i = 0; i < segments; i++) {
        const a = (i / segments) * Math.PI * 2
        pts.push({ x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r })
      }
      break
    }
    case 'ellipse': {
      const rx = shape.rx ?? 40, ry = shape.ry ?? 24
      for (let i = 0; i < segments; i++) {
        const a = (i / segments) * Math.PI * 2
        pts.push({ x: cx + Math.cos(a) * rx, y: cy + Math.sin(a) * ry })
      }
      break
    }
    case 'rectangle': {
      const w = shape.width ?? 80, h = shape.height ?? 60, cr = shape.cornerRadius ?? 0
      // build rounded rect polygon
      const hw = w / 2, hh = h / 2
      const r = Math.min(cr, hw, hh)
      if (r <= 0) {
        pts = [
          { x: cx - hw, y: cy - hh },
          { x: cx + hw, y: cy - hh },
          { x: cx + hw, y: cy + hh },
          { x: cx - hw, y: cy + hh },
        ]
      } else {
        const seg = Math.max(4, Math.floor(segments / 4))
        // top edge
        pts.push({ x: cx - hw + r, y: cy - hh })
        pts.push({ x: cx + hw - r, y: cy - hh })
        // top-right corner
        for (let i = 0; i <= seg; i++) {
          const a = -Math.PI / 2 + (i / seg) * (Math.PI / 2)
          pts.push({ x: cx + hw - r + Math.cos(a) * r, y: cy - hh + r + Math.sin(a) * r })
        }
        pts.push({ x: cx + hw, y: cy - hh + r })
        pts.push({ x: cx + hw, y: cy + hh - r })
        // bottom-right
        for (let i = 0; i <= seg; i++) {
          const a = 0 + (i / seg) * (Math.PI / 2)
          pts.push({ x: cx + hw - r + Math.cos(a) * r, y: cy + hh - r + Math.sin(a) * r })
        }
        pts.push({ x: cx + hw - r, y: cy + hh })
        pts.push({ x: cx - hw + r, y: cy + hh })
        // bottom-left
        for (let i = 0; i <= seg; i++) {
          const a = Math.PI / 2 + (i / seg) * (Math.PI / 2)
          pts.push({ x: cx - hw + r + Math.cos(a) * r, y: cy + hh - r + Math.sin(a) * r })
        }
        pts.push({ x: cx - hw, y: cy + hh - r })
        pts.push({ x: cx - hw, y: cy - hh + r })
        // top-left
        for (let i = 0; i <= seg; i++) {
          const a = Math.PI + (i / seg) * (Math.PI / 2)
          pts.push({ x: cx - hw + r + Math.cos(a) * r, y: cy - hh + r + Math.sin(a) * r })
        }
      }
      break
    }
    case 'polygon': {
      const verts = shape.vertices ?? []
      const sc = shape.scale ?? 1
      pts = verts.map((v) => ({ x: cx + v.x * sc, y: cy + v.y * sc }))
      break
    }
    case 'organic': {
      const base = shape.baseRadius ?? 40
      const n = shape.points ?? 32
      const amp = shape.noiseAmp ?? 0.25
      const freq = shape.noiseFreq ?? 3
      const phase = shape.phase ?? 0
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2
        // deterministic noise
        const noise = Math.sin(a * freq + phase) * amp + Math.sin(a * (freq * 2.3) + phase * 1.7) * amp * 0.5
        const r = base * (1 + noise)
        pts.push({ x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r })
      }
      break
    }
  }
  if (rotation) {
    pts = pts.map((p) => rotatePoint(p, cx, cy, rotation))
  }
  return pts
}

// Scanline: given list of polygons, return obstructed x-intervals on horizontal line y
export function scanlineObstructed(polygons: Point[][], y: number): [number, number][] {
  const intervals: [number, number][] = []
  for (const poly of polygons) {
    const xs: number[] = []
    const n = poly.length
    for (let i = 0, j = n - 1; i < n; j = i++) {
      const a = poly[j], b = poly[i]
      const cond = (a.y > y) !== (b.y > y)
      if (cond) {
        const xint = a.x + ((y - a.y) / (b.y - a.y)) * (b.x - a.x)
        xs.push(xint)
      }
    }
    xs.sort((u, v) => u - v)
    for (let i = 0; i + 1 < xs.length; i += 2) {
      intervals.push([xs[i], xs[i + 1]])
    }
  }
  return intervals
}

// Merge intervals
export function mergeIntervals(intervals: [number, number][]): [number, number][] {
  if (intervals.length === 0) return []
  const sorted = [...intervals].sort((a, b) => a[0] - b[0])
  const out: [number, number][] = [sorted[0]]
  for (let i = 1; i < sorted.length; i++) {
    const last = out[out.length - 1]
    if (sorted[i][0] <= last[1]) {
      last[1] = Math.max(last[1], sorted[i][1])
    } else {
      out.push([sorted[i][0], sorted[i][1]])
    }
  }
  return out
}

// Available slots on a line given shapes.
// Samples multiple vertical positions within the line box so the complete
// glyph line clears the obstacle (conservative interval union).
export function availableSlotsForShapes(
  y: number,
  W: number,
  shapes: Shape[],
  time?: number,
  lineHeight?: number
): { start: number; end: number }[] {
  const lh = Math.max(1, lineHeight ?? 1)
  const obs: [number, number][] = []
  // Conservative multi-sample across the full vertical extent of the line box
  // so the glyph line clears the obstacle at every sampled height.
  const ys = [y + 1, y + lh * 0.25, y + lh * 0.5, y + lh * 0.75, y + lh - 1].filter(
    (v, i, arr) => i === 0 || v - arr[i - 1] > 0.5
  )
  for (const s of shapes) {
    const sh = s.type === 'organic' ? { ...s, phase: (s.phase ?? 0) + (time ?? 0) * 0.6 } : s
    const poly = samplePolygon(sh)
    const pad = s.padding ?? 0
    for (const yy of ys) {
      const ivs = scanlineObstructed([poly], yy)
      for (const [a, b] of ivs) obs.push([a - pad, b + pad])
    }
  }
  const merged = mergeIntervals(obs)
  const slots: { start: number; end: number }[] = []
  let cursor = 0
  for (const [a, b] of merged) {
    const start = Math.max(0, a)
    const end = Math.min(W, b)
    if (start > cursor + 1) slots.push({ start: cursor, end: start })
    cursor = Math.max(cursor, end)
  }
  if (cursor < W - 1) slots.push({ start: cursor, end: W })
  return slots.filter((s) => s.end - s.start > 1)
}
