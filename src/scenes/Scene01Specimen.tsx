import { useScrollProgress } from '../hooks/useScrollProgress'
import { ss } from '../lib/anim'
import PlateHead from '../components/interface/PlateHead'

const WORD = 'REFLOW'
const STEP_Y = [0, 7, 2.4, 11, 4.6, 15]
const STEP_X = [0, 1.6, -1.4, 2.6, 0.4, 4.2]
const STEP_R = [-1.6, 2.2, -2.4, 1.4, -1.2, 2.8]

export default function Scene01Specimen() {
  const { ref, progress } = useScrollProgress<HTMLElement>()

  const open = ss(progress, 0.04, 0.52)
  const step = ss(progress, 0.3, 0.78)
  const settle = ss(progress, 0.66, 1)

  const panelW = 8 + open * 26
  const panelH = 64 + open * 9
  const panelTop = 15 - open * 3

  return (
    <section
      id="plate-01"
      data-plate="1"
      data-theme="light"
      ref={ref}
      className="scene"
      style={{ height: '310vh' }}
      aria-label="Plate 01, The Specimen"
    >
      <div className="scene__stage s1__stage">
        <PlateHead n={1} title="The Specimen" right="Scroll to alter the plate" />

        <div className="s1__rule" />

        <div
          className="s1__panel-mis"
          style={{ width: `${panelW}vw`, height: `${panelH}vh`, top: `${panelTop}vh` }}
          aria-hidden
        />
        <figure
          className="s1__panel"
          style={{ width: `${panelW}vw`, height: `${panelH}vh`, top: `${panelTop}vh` }}
        >
          <img
            className="img-cover"
            src="/images/editorial/drape-01.jpg"
            alt="Macro study of red cloth, lit from the left, rendered as a two-ink halftone"
            style={{ transform: `scale(${1.06 + progress * 0.16})`, transition: 'none' }}
          />
          <span className="halftone" />
        </figure>
        <h1
          className="s1__word"
          style={{
            transform: `translate3d(0, ${-settle * 3}vh, 0) scale(${1 - settle * 0.07})`,
          }}
        >
          {WORD.split('').map((letter, i) => (
            <span
              key={i}
              style={{
                transform: `translate3d(${STEP_X[i] * step + (i - 2.5) * open * 0.9}vw, ${
                  STEP_Y[i] * step
                }vh, 0) rotate(${STEP_R[i] * step}deg)`,
              }}
            >
              {letter}
            </span>
          ))}
        </h1>

        <div className="s1__notes lab" style={{ opacity: 1 - ss(progress, 0.14, 0.42) }}>
          <p>
            <b>REFLOW</b> treats language as a physical material: something with mass, an edge, and an
            appetite for space.
          </p>
          <p>
            Seven plates. One engine. No object enters the frame without a job to do.
          </p>
        </div>

        <div
          className="s1__statement"
          style={{ opacity: ss(progress, 0.42, 0.78), transform: `translate3d(0, ${(1 - ss(progress, 0.42, 0.78)) * 18}px, 0)` }}
        >
          <p>
            What if words
            <br />
            <em>were material?</em>
          </p>
          <div className="lab">An exhibition in seven plates / 2026</div>
        </div>

        <div className="s1__credits lab lab--xs">
          <div>
            <span className="k">Type</span>
            <span className="v">Oswald × Instrument Serif</span>
          </div>
          <div>
            <span className="k">Method</span>
            <span className="v">Geometry-aware text layout</span>
          </div>
          <div>
            <span className="k">Imagery</span>
            <span className="v">Original two-ink duotones</span>
          </div>
          <div>
            <span className="k">Plate</span>
            <span className="v">01 of 07 — Specimen</span>
          </div>
        </div>
      </div>
    </section>
  )
}
