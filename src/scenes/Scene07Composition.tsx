import { useScrollProgress } from '../hooks/useScrollProgress'
import { ss } from '../lib/anim'
import PlateHead from '../components/interface/PlateHead'

export default function Scene07Composition() {
  const { ref, progress } = useScrollProgress<HTMLElement>()

  const reveal = (start: number) => {
    const a = 0.74 + 0.26 * ss(progress, start, start + 0.26)
    return {
      clipPath: `inset(${(1 - a) * 105}% 0 -5% 0)`,
      transform: `translate3d(0, ${(1 - a) * 3}vh, 0)`,
      opacity: 0.55 + a * 0.45,
    } as const
  }

  const photo = ss(progress, 0.16, 0.62)
  const fin = ss(progress, 0.5, 1)

  return (
    <section
      id="plate-07"
      data-plate="7"
      data-theme="dark"
      ref={ref}
      className="scene"
      style={{ height: '250vh' }}
      aria-label="Plate 07, The Composition"
    >
      <div className="scene__stage s7__stage">
        <PlateHead n={7} title="The Composition" right="End of sequence" />

        <h2 className="s7__line1" style={reveal(0.04)}>
          WORDS
        </h2>
        <h2 className="s7__line2" style={reveal(0.1)}>
          OCCUPY
        </h2>
        <h2 className="s7__line3" style={reveal(0.16)}>
          SPACE
        </h2>

        <figure
          className="s7__photo"
          style={{ transform: `translate3d(0, ${(1 - photo) * 12}vh, 0)`, opacity: 0.7 + photo * 0.3 }}
        >
          <img
            className="img-cover"
            src="/images/editorial/field-01.jpg"
            alt="Two figures walking a red hill at dusk, cut-paper silhouette in vermilion and paper"
            style={{ transform: `scale(${1.08 - fin * 0.06})` }}
          />
          <span className="halftone" />
        </figure>
        <div className="s7__photo-cap" style={{ opacity: photo }}>
          Fig. 07 — field / after the last frame
        </div>

        <div className="s7__rule" style={{ transform: `scaleX(${ss(progress, 0.28, 0.7)})` }} />

        <div className="s7__meta lab lab--xs" style={{ opacity: 0.55 + ss(progress, 0.3, 0.7) * 0.45 }}>
          <div>
            <span className="k">Statement</span>
            <span className="v">Words occupy space.</span>
          </div>
          <div>
            <span className="k">Consequence</span>
            <span className="v">Space changes words.</span>
          </div>
          <div>
            <span className="k">Engine</span>
            <span className="v">Reflow / 2026</span>
          </div>
        </div>

        <div
          className="s7__wordmark"
          style={{ transform: `translate3d(0, ${(1 - fin) * 16}vh, 0)` }}
          aria-hidden
        >
          REFLOW
        </div>

        <div
          className="chrome__corner"
          style={{ bottom: '20vh', left: '5vw', opacity: 0.45, position: 'absolute', width: 13, height: 13 }}
          aria-hidden
        />
      </div>
    </section>
  )
}
