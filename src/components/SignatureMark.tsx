import { useEffect, useMemo, useRef, useState } from 'react'
import { clearMeasureCache, layoutText, measureCached, type FontSpec, type Shape } from '../lib/typography'
import { useReducedMotion } from '../hooks/useReducedMotion'

const NAME = 'Likhit'
const FAMILY = "'Instrument Serif', Georgia, serif"

const clamp = (v: number, lo: number, hi: number) => (v < lo ? lo : v > hi ? hi : v)
const lerp = (a: number, b: number, t: number) => a + (b - a) * t

const dotRadius = (fontSize: number) => Math.max(4.5, fontSize * 0.115)

interface Metrics {
  w: number
  font: FontSpec
  fontSize: number
  bySize: number
  lineH: number
  nameTop: number
  height: number
}

/**
 * The author's signature, set as a small composition of the same engine the
 * plates use: a specimen dot passes through the name and the letters give way
 * to the space it occupies. The dot's passage is driven by scroll, so the name
 * settles around it as the page comes to rest.
 */
export default function SignatureMark() {
  const rootRef = useRef<HTMLDivElement>(null)
  const dotRef = useRef<HTMLSpanElement>(null)
  const glyphRefs = useRef<(HTMLSpanElement | null)[]>([])
  const reduced = useReducedMotion()
  const [width, setWidth] = useState(0)
  const [epoch, setEpoch] = useState(0)

  const metrics = useMemo<Metrics>(() => {
    const w = width || 380
    const fontSize = Math.round(clamp(w * 0.24, 44, 150))
    const bySize = Math.round(clamp(fontSize * 0.36, 18, 48))
    const lineH = Math.round(fontSize * 1.02)
    const nameTop = bySize + Math.round(fontSize * 0.18)
    return {
      w,
      fontSize,
      bySize,
      lineH,
      nameTop,
      height: nameTop + lineH * 2,
      font: { family: FAMILY, size: fontSize, weight: 400, lineHeight: lineH / fontSize },
    }
  }, [width])

  // Web fonts load after first paint: measured fallback metrics would leave the
  // letters slightly wrong, so re-measure once the real face swaps in.
  useEffect(() => {
    let alive = true
    const refresh = () => {
      clearMeasureCache()
      if (alive) setEpoch((e) => e + 1)
    }
    document.fonts?.ready.then(refresh)
    document.fonts?.addEventListener('loadingdone', refresh)
    return () => {
      alive = false
      document.fonts?.removeEventListener('loadingdone', refresh)
    }
  }, [])

  useEffect(() => {
    const el = rootRef.current
    if (!el) return
    const sync = () => setWidth(el.clientWidth)
    if (typeof ResizeObserver === 'undefined') {
      sync()
      window.addEventListener('resize', sync)
      return () => window.removeEventListener('resize', sync)
    }
    const ro = new ResizeObserver(sync)
    ro.observe(el)
    sync()
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    const root = rootRef.current
    const dot = dotRef.current
    if (!root || !dot || !width) return

    const { w, font, fontSize, lineH, nameTop } = metrics
    const radius = dotRadius(fontSize)
    const pad = Math.max(7, fontSize * 0.15)
    const nameW = measureCached(NAME, font)
    const startX = -radius - 2
    const restX = Math.max(radius + 4, Math.min(w - radius - 2, nameW + radius + pad + 8))
    const lineCy = nameTop + lineH * 0.5
    const last = glyphRefs.current.map(() => Number.NaN)

    // Lay the name out around the specimen and write positions straight to the
    // DOM — no React state per frame, so the signature never re-renders.
    const place = (cx: number, cy: number) => {
      const shape: Shape = {
        id: 'signature-mark',
        type: 'circle',
        cx,
        cy,
        radius,
        padding: pad,
        rotation: 0,
      }
      const res = layoutText(NAME, w, font, [shape], { align: 'left', granularity: 'glyph' })
      const at: ({ x: number; y: number } | undefined)[] = new Array(NAME.length).fill(undefined)
      for (const line of res.lines) {
        for (const seg of line.segments) {
          if (seg.index === undefined) continue
          at[seg.index] = { x: seg.x, y: line.y }
        }
      }

      for (let i = 0; i < NAME.length; i++) {
        const el = glyphRefs.current[i]
        if (!el) continue
        const pos = at[i]
        if (!pos) {
          el.style.opacity = '0'
          last[i] = Number.NaN
          continue
        }
        const key = Math.round(pos.x * 32) * 100000 + Math.round(pos.y * 32)
        if (last[i] === key) continue
        last[i] = key
        el.style.transform = `translate3d(${pos.x.toFixed(2)}px, ${pos.y.toFixed(2)}px, 0)`
        el.style.opacity = '1'
      }

      dot.style.transform = `translate3d(${(cx - radius).toFixed(2)}px, ${(cy - radius).toFixed(2)}px, 0)`
      dot.style.opacity = '1'
    }

    // Reduced motion (or no observer support): the dot rests after the name
    // and the letters stay composed — a static signature, still set by the engine.
    if (reduced || typeof IntersectionObserver === 'undefined') {
      place(restX, lineCy)
      return
    }

    let raf = 0
    let shown: number | null = null
    const t0 = performance.now()

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick)
      const vh = window.innerHeight || 800
      const rect = root.getBoundingClientRect()
      const target = clamp((vh - rect.top) / (vh * 0.62), 0, 1)
      // Damped so the dot has mass: it lags the scroll and comes to rest.
      shown = shown === null ? target : shown + (target - shown) * 0.06
      const eased = shown * shown * (3 - 2 * shown)
      const t = (now - t0) / 1000
      const driftX = Math.sin(t * 0.37) * 1.5 + Math.sin(t * 0.17 + 1.4) * 0.8
      const driftY = Math.cos(t * 0.29) * 2 + Math.sin(t * 0.11 + 0.6) * 0.9
      place(
        lerp(startX, restX, eased) + driftX * (0.35 + 0.65 * eased),
        lineCy - Math.sin(eased * Math.PI) * fontSize * 0.13 + driftY
      )
    }

    let visible = false
    const io = new IntersectionObserver(
      (entries) => {
        const next = entries.some((e) => e.isIntersecting)
        if (next === visible) return
        visible = next
        if (next) {
          if (!raf) raf = requestAnimationFrame(tick)
        } else if (raf) {
          cancelAnimationFrame(raf)
          raf = 0
        }
      },
      { rootMargin: '12% 0px' }
    )
    io.observe(root)
    place(startX, lineCy)

    return () => {
      io.disconnect()
      if (raf) cancelAnimationFrame(raf)
    }
  }, [metrics, width, reduced, epoch])

  const radius = dotRadius(metrics.fontSize)

  return (
    <div className="sig__mark" ref={rootRef}>
      <div className="sig__stage" style={{ height: metrics.height }}>
        <span className="sig__by" style={{ fontSize: metrics.bySize }}>
          By{' '}
        </span>
        <div
          className="sig__name"
          style={{ top: metrics.nameTop, height: metrics.lineH * 2, fontSize: metrics.fontSize }}
        >
          {Array.from(NAME).map((ch, i) => (
            <span
              key={i}
              className="sig__glyph"
              ref={(el) => {
                glyphRefs.current[i] = el
              }}
              style={{ lineHeight: `${metrics.lineH}px` }}
            >
              {ch}
            </span>
          ))}
        </div>
        <span
          className="sig__dot"
          ref={dotRef}
          aria-hidden="true"
          style={{ width: radius * 2, height: radius * 2 }}
        />
      </div>
    </div>
  )
}
