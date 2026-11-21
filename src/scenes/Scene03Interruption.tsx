import { useMemo } from 'react'
import { useScrollProgress } from '../hooks/useScrollProgress'
import { useElementSize } from '../hooks/useElementSize'
import FlowText from '../components/FlowText'
import PlateHead from '../components/interface/PlateHead'
import { ss } from '../lib/anim'
import { availableSlotsForShapes, samplePolygon, type Shape } from '../lib/geometry'
import type { FontSpec } from '../lib/typography'
import { FIGURE, FIGURE_HEIGHT } from '../lib/figure'

const BODY =
  'Language arrives in lines, and lines arrive in a body. Introduce a figure and the paragraph must negotiate: it splits, wraps, steps around the contour and regroups on the far side. Nothing is deleted. The sentence simply learns the shape of the obstacle, and carries its meaning through the gap that remains.'

const FONT: FontSpec = {
  family: "'Space Grotesk', system-ui, sans-serif",
  size: 22,
  weight: 500,
  lineHeight: 1.58,
  letterSpacing: 0.1,
}

export default function Scene03Interruption() {
  const { ref, progress } = useScrollProgress<HTMLElement>()
  const { ref: stageRef, size } = useElementSize<HTMLDivElement>()

  const W = size.w || 900
  const H = size.h || 420
  const scale = (H * 0.98) / FIGURE_HEIGHT
  // A narrow measure cannot hold the desktop size: the paragraph would run
  // past the stage and under the statistics.
  const font = useMemo<FontSpec>(() => ({ ...FONT, size: W < 520 ? 15 : 22 }), [W])

  const shape = useMemo<Shape>(
    () => ({
      id: 'figure',
      type: 'polygon',
      vertices: FIGURE,
      scale,
      cx: W * (0.9 - 0.72 * ss(progress, 0.05, 0.95)),
      cy: H * 0.5 + Math.sin(progress * Math.PI) * H * 0.035,
      rotation: -0.045 + progress * 0.09,
      padding: 22,
    }),
    [W, H, scale, progress]
  )

  const poly = useMemo(() => samplePolygon(shape, 64), [shape])
  const bbox = useMemo(() => {
    const minX = Math.min(...poly.map((p) => p.x))
    const maxX = Math.max(...poly.map((p) => p.x))
    const minY = Math.min(...poly.map((p) => p.y))
    const maxY = Math.max(...poly.map((p) => p.y))
    const bw = Math.max(1, maxX - minX)
    const bh = Math.max(1, maxY - minY)
    const clip = `polygon(${poly
      .map((p) => `${(((p.x - minX) / bw) * 100).toFixed(2)}% ${(((p.y - minY) / bh) * 100).toFixed(2)}%`)
      .join(', ')})`
    return { minX, maxX, minY, maxY, bw, bh, clip }
  }, [poly])
  const { minX, maxX, minY, bw, bh, clip } = bbox

  const shapes = useMemo(() => [shape], [shape])
  const intervals = availableSlotsForShapes(H * 0.5, W, shapes, 0, font.size * font.lineHeight).length

  return (
    <section
      id="plate-03"
      data-plate="3"
      data-theme="light"
      ref={ref}
      className="scene"
      style={{ height: '300vh' }}
      aria-label="Plate 03, Interruption"
    >
      <div className="scene__stage s3__stage">
        <PlateHead n={3} title="Interruption" right="Text / contour / consequence" />

        <h2 className="s3__title">
          INTER
          <br />
          <span>RUPTION</span>
        </h2>

        <div className="s3__lede">
          <p>The sentence does not resist the body. It redistributes around it.</p>
          <div className="lab lab--xs">Object 01 — silhouette, 30 vertices, rotation ±5°</div>
        </div>

        <div className="s3__col-rule" aria-hidden />

        <div className="s3__body" ref={stageRef}>
          <FlowText
            text={BODY}
            font={font}
            align="left"
            stageHeight={H}
            color="var(--ink)"
            shapes={shapes}
            time={0}
          />

          {/* misregistered ink pass */}
          <div
            className="s3__figure"
            aria-hidden
            style={{
              left: minX - 7,
              top: minY + 5,
              width: bw,
              height: bh,
              clipPath: clip,
              transform: 'translate3d(0,0,0)',
              opacity: 0.35,
              zIndex: 2,
            }}
          >
            <div className="s3__figure-mis" />
          </div>

          <div
            className="s3__figure"
            style={{ left: minX, top: minY, width: bw, height: bh, clipPath: clip }}
            aria-hidden
          >
            <div className="s3__figure-img" />
          </div>

          <div
            className="s3__anno"
            style={{
              left: Math.max(0, Math.min(W - 150, maxX + 18)),
              top: -34,
              opacity: ss(progress, 0.25, 0.45),
            }}
          >
            Silhouette / figure 01
          </div>
        </div>

        <div className="s3__vert lab lab--xs">Object traverses the measure</div>

        <div className="s3__footer" style={{ opacity: ss(progress, 0.7, 0.95) }}>
          <p>Meaning is not broken. It is re-set.</p>
        </div>

        <div className="s3__stats lab lab--xs">
          <div>
            Intervals <b>{String(intervals).padStart(2, '0')}</b>
          </div>
          <div>
            Clearance <b>22 px</b>
          </div>
          <div>
            Reflow <b>{String(Math.round(progress * 100)).padStart(3, '0')}%</b>
          </div>
        </div>
      </div>
    </section>
  )
}
