import { useScrollProgress } from '../hooks/useScrollProgress'
import { ss } from '../lib/anim'
import PlateHead from '../components/interface/PlateHead'

const ROWS = [
  { indent: 0, color: 'var(--ink)' },
  { indent: 8, color: 'var(--ink)' },
  { indent: -3, color: 'var(--vermilion)' },
  { indent: 11, color: 'var(--red)' },
  { indent: 3, color: 'var(--soft)' },
]

export default function Scene04Distortion() {
  const { ref, progress } = useScrollProgress<HTMLElement>()

  const distort = ss(progress, 0.02, 0.52)
  const compress = ss(progress, 0.42, 0.8)
  const resolve = ss(progress, 0.72, 1)

  return (
    <section
      id="plate-04"
      data-plate="4"
      data-theme="light"
      ref={ref}
      className="scene"
      style={{ height: '290vh' }}
      aria-label="Plate 04, Distortion"
    >
      <div className="scene__stage s4__stage">
        <div className="s4__grid" />
        <PlateHead n={4} title="Distortion" right="Type under pressure" />

        <div className="s4__num" aria-hidden>
          04
        </div>

        <div className="s4__stack" aria-hidden>
          {ROWS.map((row, i) => (
            <div
              key={i}
              className="s4__row"
              style={{
                marginLeft: `${row.indent}vw`,
                color: row.color,
                opacity: 0.94 - resolve * 0.87,
                letterSpacing: `${-0.03 - compress * 0.055}em`,
                transform: `translate3d(${(i - 2) * distort * 2.2}vw, ${
                  -compress * i * 5.6 + (i - 2) * distort * 0.8
                }vh, 0) skewX(${(i - 2) * distort * 4.5}deg) scaleX(${
                  (1 - compress * 0.34) * (1 + distort * 0.02 * i)
                }) scaleY(${1 + distort * 0.12})`,
              }}
            >
              MEANING
            </div>
          ))}
        </div>

        <div
          className="s4__final"
          style={{
            opacity: resolve,
            clipPath: `inset(-12% ${(1 - resolve) * 42}% -12% ${(1 - resolve) * 42}%)`,
            transform: `scale(${1.06 - resolve * 0.06})`,
          }}
        >
          <span>meaning</span>
        </div>

        <div className="s4__foot">
          <p>
            It was never the letters.
            <br />
            It was the space they were given.
          </p>
          <div className="lab lab--xs">
            Shear / 18° · tracking / −0.085 em · scale x / 0.66
            <br />
            Plate 04 / typography only — five rows, one word
          </div>
        </div>
      </div>
    </section>
  )
}
