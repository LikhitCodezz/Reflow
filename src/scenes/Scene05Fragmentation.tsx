import { useScrollProgress } from '../hooks/useScrollProgress'
import { ss } from '../lib/anim'
import PlateHead from '../components/interface/PlateHead'

const BANDS = 9
const BAND_H = 100 / BANDS

export default function Scene05Fragmentation() {
  const { ref, progress } = useScrollProgress<HTMLElement>()

  const frag = ss(progress, 0.02, 0.64)
  const land = ss(progress, 0.7, 1)
  const gap = (1.05 + frag * 1.5) * (1 - land)
  const drift = frag * (1 - land)

  return (
    <section
      id="plate-05"
      data-plate="5"
      data-theme="dark"
      ref={ref}
      className="scene"
      style={{ height: '330vh' }}
      aria-label="Plate 05, Fragmentation"
    >
      <div className="scene__stage s5__stage">
        <PlateHead n={5} title="Fragmentation" right="Nine strips / one sentence" />

        <div className="s5__image" style={{ opacity: 0.62 + frag * 0.34 }}>
          <img
            className="img-cover"
            src="/images/editorial/arches-01.jpg"
            alt="An arcade of three arches with raking light, printed as a two-ink duotone"
            style={{ transform: `scale(${1.14 - frag * 0.1})` }}
          />
          <span className="halftone" />
        </div>

        <div className="s5__indices lab lab--xs" style={{ opacity: 0.55 * (1 - land) }}>
          {Array.from({ length: BANDS }, (_, i) => (
            <span key={i}>
              <b>{String(i + 1).padStart(2, '0')}</b>
            </span>
          ))}
        </div>

        <div className="s5__bands" style={{ opacity: 1 - land }}>
          {Array.from({ length: BANDS }, (_, i) => {
            const dir = i % 2 === 0 ? -1 : 1
            const dx = dir * (7 + i * 3.1) * drift
            const top = i * BAND_H + gap * 0.5
            return (
              <div
                key={i}
                className="s5__band"
                style={{
                  top: `${top}vh`,
                  height: `${BAND_H - gap}vh`,
                  transform: `translate3d(${dx}vw, 0, 0)`,
                }}
              >
                <div
                  className="s5__typeblock"
                  style={{ position: 'absolute', top: `${-top + 15}vh`, left: '5vw', height: '100vh' }}
                  aria-hidden={i > 0}
                >
                  LANGUAGE
                  <br />
                  BREAKS
                  <br />
                  <em>APART</em>
                </div>
              </div>
            )
          })}
        </div>

        <div className="s5__veil" style={{ opacity: land }} />

        <div
          className="s5__final-type"
          style={{ opacity: land, transform: `translate3d(0, ${(1 - land) * 3}vh, 0)` }}
        >
          LANGUAGE
          <br />
          BREAKS
          <br />
          <em>APART</em>
        </div>

        <figure
          className="s5__panel"
          style={{
            opacity: land,
            clipPath: `inset(${(1 - land) * 100}% 0 0 0)`,
            transform: `translate3d(0, ${(1 - land) * 4}vh, 0)`,
          }}
        >
          <img className="img-cover" src="/images/editorial/field-01.jpg" alt="Two figures on a red hill, screenprinted in two inks" />
          <span className="halftone" />
          <figcaption className="s5__panel-cap">Fig. 05 — field / after the break</figcaption>
        </figure>

        <div className="s5__foot lab lab--xs" style={{ opacity: 0.62 * (1 - land) }}>
          <span>A sentence in nine strips</span>
          <span>09 fragments / one image beneath</span>
        </div>

        <div className="s5__statement" style={{ opacity: land, transform: `translate3d(0, ${(1 - land) * 20}px, 0)` }}>
          <p>
            The sentence learns
            <br />
            to live <em>in pieces.</em>
          </p>
          <div className="lab lab--xs" style={{ marginTop: 10, opacity: 0.65 }}>
            Reassembly / 9 of 9
          </div>
        </div>
      </div>
    </section>
  )
}
