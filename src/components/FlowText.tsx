import React, { useEffect, useRef, useState } from 'react'
import { layoutText, clearMeasureCache, type FontSpec, type Line, type Align, type Shape } from '../lib/typography'

interface Props {
  text: string
  font: FontSpec
  shapes?: Shape[] | ((w: number) => Shape[])
  time?: number
  align?: Align
  maxWidth?: number
  color?: string
  className?: string
  style?: React.CSSProperties
  stageHeight?: number
  onHeight?: (h: number) => void
}

export default function FlowText({
  text,
  font,
  shapes,
  time = 0,
  align = 'left',
  maxWidth,
  color,
  className,
  style,
  stageHeight,
  onHeight,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)
  const [lines, setLines] = useState<Line[]>([])
  const [height, setHeight] = useState(stageHeight ?? 0)
  const [fontEpoch, setFontEpoch] = useState(0)

  // Web fonts load after first paint: cached fallback metrics would leave words
  // slightly overlapped once the real face swaps in, so re-measure when fonts settle.
  useEffect(() => {
    let alive = true
    const refresh = () => {
      clearMeasureCache()
      if (alive) setFontEpoch((e) => e + 1)
    }
    document.fonts?.ready.then(refresh)
    document.fonts?.addEventListener('loadingdone', refresh)
    return () => {
      alive = false
      document.fonts?.removeEventListener('loadingdone', refresh)
    }
  }, [])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(() => setWidth(el.clientWidth))
    ro.observe(el)
    setWidth(el.clientWidth)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    if (!width) return
    const sh = typeof shapes === 'function' ? shapes(width) : (shapes ?? [])
    const res = layoutText(text, width, font, sh, { time, align, maxWidth })
    setLines(res.lines)
    const h = stageHeight ?? res.height
    setHeight(h)
    onHeight?.(res.height)
  }, [text, width, font, shapes, time, align, maxWidth, stageHeight, onHeight, fontEpoch])

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ position: 'relative', width: '100%', height, color, ...style }}
    >
      {lines.map((line, idx) => (
        <div
          key={idx}
          style={{
            position: 'absolute',
            top: line.y,
            left: 0,
            width: '100%',
            height: line.height,
            lineHeight: `${line.height}px`,
            pointerEvents: 'none',
          }}
        >
          {line.segments.map((seg, si) => (
            <span
              key={si}
              style={{
                position: 'absolute',
                left: seg.x,
                top: 0,
                whiteSpace: 'pre',
                fontFamily: font.family,
                fontSize: font.size,
                fontWeight: font.weight,
                letterSpacing: font.letterSpacing ? `${font.letterSpacing}px` : undefined,
                lineHeight: `${line.height}px`,
                color: 'inherit',
              }}
            >
              {seg.text}
            </span>
          ))}
        </div>
      ))}
    </div>
  )
}
