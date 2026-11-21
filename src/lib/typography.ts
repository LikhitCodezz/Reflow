import { availableSlotsForShapes, type Shape } from './geometry'

export type { Shape } from './geometry'
export type { ShapeType } from './geometry'
export type Align = 'left' | 'center' | 'right' | 'justify'

/**
 * Layout unit. 'word' (default) keeps words whole, which is what the plates
 * need. 'glyph' lays out one character at a time so a shape can part a single
 * word around itself — used by the author's signature.
 */
export type Granularity = 'word' | 'glyph'

export interface FontSpec {
  family: string
  size: number
  weight: number
  lineHeight: number
  letterSpacing?: number
}

export interface Segment {
  text: string
  x: number
  width: number
  slotStart: number
  slotEnd: number
  /** Glyph index in the run — only set by glyph-granularity layout. */
  index?: number
}

export interface Line {
  y: number
  segments: Segment[]
  height: number
}

export interface LayoutResult {
  lines: Line[]
  width: number
  height: number
}

let canvas: HTMLCanvasElement | null = null
let ctx: CanvasRenderingContext2D | null = null

function getContext(): CanvasRenderingContext2D {
  if (!ctx) {
    canvas = document.createElement('canvas')
    ctx = canvas.getContext('2d')!
  }
  return ctx
}

export function setFont(c: CanvasRenderingContext2D, font: FontSpec) {
  c.font = `${font.weight} ${font.size}px ${font.family}`
  c.letterSpacing = font.letterSpacing ? `${font.letterSpacing}px` : '0px'
}

export function measureText(text: string, font: FontSpec): number {
  const c = getContext()
  setFont(c, font)
  return c.measureText(text).width
}

const measureCache = new Map<string, number>()
export function clearMeasureCache() {
  measureCache.clear()
}
export function measureCached(text: string, font: FontSpec): number {
  const key = `${font.family}|${font.size}|${font.weight}|${font.letterSpacing ?? 0}|${text}`
  const hit = measureCache.get(key)
  if (hit !== undefined) return hit
  const m = measureText(text, font)
  if (measureCache.size > 8000) measureCache.clear()
  measureCache.set(key, m)
  return m
}

interface RawSegment {
  text: string
  x: number
  width: number
  slotStart: number
  slotEnd: number
  slotIndex: number
  index?: number
}

interface Token {
  text: string
  /** Glyph index in the run, or -1 for a whole word / inter-word space. */
  index: number
}

/**
 * Interval-based typographic layout.
 * Scanlines → shape intersections → available intervals → words fitted into intervals.
 */
export function layoutText(
  text: string,
  containerWidth: number,
  font: FontSpec,
  shapes: Shape[] | null,
  opts: { time?: number; align?: Align; maxWidth?: number; granularity?: Granularity } = {}
): LayoutResult {
  const W = Math.max(40, Math.min(containerWidth, opts.maxWidth ?? containerWidth))
  const align: Align = opts.align ?? 'left'
  const time = opts.time ?? 0
  const glyphMode = opts.granularity === 'glyph'
  const lh = font.size * font.lineHeight
  const spaceW = measureCached(' ', font)
  const slotsSource = shapes && shapes.length ? shapes : null

  const lines: Line[] = []
  let y = 0
  let glyphIndex = 0

  const paragraphs = text.replace(/\r/g, '').split(/\n/)
  // In word mode a slot narrower than a few characters produces orphan words
  // ("the" alone against a silhouette), so it is skipped entirely. In glyph
  // mode a slot only has to hold one letter.
  const minSlot = glyphMode ? Math.max(6, font.size * 0.5) : Math.max(8, font.size * 2.6)

  for (let pi = 0; pi < paragraphs.length; pi++) {
    const raw = paragraphs[pi].trim()
    if (!raw) {
      y += lh * 0.6
      continue
    }
    const rawWords = raw.split(/\s+/).filter(Boolean)
    const words: string[] = []
    for (const w of rawWords) {
      if (measureCached(w, font) <= W) {
        words.push(w)
        continue
      }
      // break unusually long words at grapheme boundaries
      let chunk = ''
      for (const ch of Array.from(w)) {
        const test = chunk + ch
        if (chunk === '' || measureCached(test, font) <= W) {
          chunk = test
        } else {
          if (chunk) words.push(chunk)
          chunk = ch
        }
      }
      if (chunk) words.push(chunk)
    }
    const tokens: Token[] = []
    if (glyphMode) {
      for (let wi = 0; wi < words.length; wi++) {
        if (wi > 0) tokens.push({ text: ' ', index: -1 })
        for (const ch of Array.from(words[wi])) tokens.push({ text: ch, index: glyphIndex++ })
      }
    } else {
      for (const word of words) tokens.push({ text: word, index: -1 })
    }

    let i = 0
    let guard = 0

    while (i < tokens.length && guard < 20000) {
      guard++
      const iBefore = i
      const slots = slotsSource
        ? availableSlotsForShapes(y, W, slotsSource, time, lh)
        : [{ start: 0, end: W }]

      const usable = slots.filter((s) => s.end - s.start >= minSlot)
      const segments: RawSegment[] = []
      let slotIndex = 0
      let slot = usable.length ? usable[0] : null
      let cursor = slot ? slot.start : 0

      while (i < tokens.length && slot) {
        const tok = tokens[i]
        // A space token only opens the gap between two words; when it lands at
        // the start of a slot the slot already provides that gap.
        if (tok.index < 0 && tok.text === ' ') {
          if (cursor > slot.start + 0.5) cursor += spaceW
          i++
          continue
        }
        const ww = measureCached(tok.text, font)
        const needSpace = !glyphMode && cursor > slot.start + 0.5
        const total = ww + (needSpace ? spaceW : 0)

        if (cursor + total <= slot.end + 0.5) {
          const x = needSpace ? cursor + spaceW : cursor
          segments.push({
            text: tok.text,
            x,
            width: ww,
            slotStart: slot.start,
            slotEnd: slot.end,
            slotIndex,
            index: tok.index >= 0 ? tok.index : undefined,
          })
          cursor = x + ww
          i++
        } else if (ww <= slot.end - slot.start) {
          // word fits in this slot but not remaining space → next slot on same line
          slotIndex++
          slot = slotIndex < usable.length ? usable[slotIndex] : null
          if (slot) cursor = slot.start
        } else {
          // word wider than remaining space in this slot → try next slot on same line
          slotIndex++
          const next = slotIndex < usable.length ? usable[slotIndex] : null
          if (next) {
            slot = next
            cursor = slot.start
          } else {
            // no slot can fit this word on this line → finalize line and retry next line
            slot = null
          }
        }
      }

      // no progress at all (line fully obstructed) — advance one line
      if (i === iBefore && !segments.length) {
        y += lh
        continue
      }

      const isLastLine = i >= tokens.length
      const finalSegments = applyAlignment(segments, align, spaceW, isLastLine, glyphMode)
      lines.push({ y, segments: finalSegments, height: lh })
      y += lh
    }

    // paragraph gap
    if (pi < paragraphs.length - 1) y += lh * 0.4
  }

  return { lines, width: W, height: y }
}

function applyAlignment(
  segments: RawSegment[],
  align: Align,
  spaceW: number,
  isLastLine = false,
  glyphMode = false
): Segment[] {
  if (!segments.length) return []
  // group by slot
  const groups = new Map<number, RawSegment[]>()
  for (const s of segments) {
    const arr = groups.get(s.slotIndex)
    if (arr) arr.push(s)
    else groups.set(s.slotIndex, [s])
  }
  const out: Segment[] = []

  for (const group of groups.values()) {
    const first = group[0]
    const last = group[group.length - 1]
    const slotW = first.slotEnd - first.slotStart
    const contentW = last.x + last.width - first.x
    const free = slotW - contentW

    if (align === 'justify' && !glyphMode && !isLastLine && group.length > 1 && free > 0.5) {
      const gaps = group.length - 1
      const extra = free / gaps
      let x = first.slotStart
      for (let k = 0; k < group.length; k++) {
        const s = group[k]
        out.push({ text: s.text, x, width: s.width, slotStart: s.slotStart, slotEnd: s.slotEnd, index: s.index })
        x += s.width + spaceW + extra
      }
      continue
    }

    let shift = 0
    if (align === 'center') shift = free / 2
    else if (align === 'right') shift = free
    for (const s of group) {
      out.push({
        text: s.text,
        x: s.x + shift,
        width: s.width,
        slotStart: s.slotStart,
        slotEnd: s.slotEnd,
        index: s.index,
      })
    }
  }

  out.sort((a, b) => a.x - b.x)
  return out
}
