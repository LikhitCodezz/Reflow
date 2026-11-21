import { useScrollProgress } from '../hooks/useScrollProgress'
import { ss } from '../lib/anim'
import PlateHead from '../components/interface/PlateHead'

export default function Scene02Expansion() {
  const { ref, progress } = useScrollProgress<HTMLElement>()

  const expand = ss(progress, 0, 0.32)
  const split = ss(progress, 0.38, 0.76)
  const reveal = ss(progress, 0.24, 0.76)

  const fillStyle = {
    backgroundImage: 'url(/images/editorial/field-01.jpg)',
    backgroundSize: `${115 + expand * 30}% auto`,
    backgroundPosition: `${40 - expand * 18}% ${46 + progress * 10}%`,
  }

  return (
    <section
      id="plate-02"
      data-plate="2"
      data-theme="dark"
      ref={ref}
      className="scene"
      style={{ height: '300vh' }}
      aria-label="Plate 02, Expansion"
    >
      <div className="scene__stage s2__stage">
        <PlateHead n={2} title="Expansion" right="Type as aperture" />

        <div
          className="s2__image"
          style={{
            clipPath: `inset(${(1 - reveal) * 30}% ${(1 - reveal) * 34}%)`,
            opacity: Math.min(1, reveal * 1.6),
          }}
        >
          <img
            className="img-cover"
            src="/images/editorial/field-01.jpg"
            alt="Two figures walking a vermilion hill at dusk, printed in two inks"
            style={{ transform: `scale(${1.12 - reveal * 0.12})` }}
          />
          <span className="halftone" />
        </div>
        <div className="s2__frame" style={{ opacity: reveal * 0.9 }} />

        <div className="s2__wordwrap" style={{ transform: `scale(${1 + expand * 0.9})` }}>
          {[0, 1].map((side) => (
            <div
              key={side}
              className="s2__half"
              style={{
                clipPath: side === 0 ? 'polygon(0% 0%, 48% 0%, 40% 100%, 0% 100%)' : 'polygon(48% 0%, 100% 0%, 100% 100%, 40% 100%)',
                transform: `translate3d(${(side === 0 ? -1 : 1) * split * 46}vw, ${-4 + split * 3}vh, 0)`,
              }}
            >
              <div style={{ position: 'relative', display: 'inline-block', lineHeight: 0.8 }}>
                <span
                  className="s2__word"
                  aria-hidden
                  style={{
                    ...fillStyle,
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    zIndex: 0,
                    backgroundImage: 'none',
                    backgroundColor: '#791d27',
                  }}
                >
                  EXPAND
                </span>
                <span className="s2__word" style={{ ...fillStyle, position: 'relative', zIndex: 1 }}>
                  EXPAND
                </span>
              </div>
            </div>
          ))}
        </div>

        <div
          className="s2__statement"
          style={{ opacity: ss(progress, 0.66, 0.92), transform: `translate3d(0, ${(1 - ss(progress, 0.66, 0.92)) * 24}px, 0)` }}
        >
          <p>
            The image was inside
            <br />
            the word <em>all along.</em>
          </p>
        </div>

        <div className="s2__spec lab lab--xs" style={{ opacity: ss(progress, 0.7, 0.95) * 0.8 }}>
          Fig. 02 / field, 3:2
          <br />
          Duotone: ink × vermilion
          <br />
          Aperture 100%
        </div>
      </div>
    </section>
  )
}
