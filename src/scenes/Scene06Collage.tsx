import { useScrollProgress } from '../hooks/useScrollProgress'
import { ss } from '../lib/anim'
import PlateHead from '../components/interface/PlateHead'

const BARS = [4, 1, 2, 1, 3, 1, 1, 4, 1, 2, 3, 1, 2, 1, 4, 1, 1, 3, 2, 1]

function Barcode() {
  let x = 0
  return (
    <svg viewBox="0 0 130 30" preserveAspectRatio="none" aria-hidden>
      {BARS.map((b, i) => {
        const el = <rect key={i} x={x} y={0} width={b * 2} height={30} fill="currentColor" />
        x += b * 2 + (i % 3 === 0 ? 2 : 1)
        return el
      })}
    </svg>
  )
}

function Seal({ rotation }: { rotation: number }) {
  return (
    <svg viewBox="0 0 100 100" aria-hidden>
      <defs>
        <path id="reflow-seal" d="M50,50 m-37,0 a37,37 0 1,1 74,0 a37,37 0 1,1 -74,0" />
      </defs>
      <g transform={`rotate(${rotation} 50 50)`}>
        <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.5" />
        <text fontSize="6.4" letterSpacing="2.2" fill="currentColor">
          <textPath href="#reflow-seal" startOffset="2%">
            REFLOW — PLATE 06 — ASSEMBLED IN NINE MOVES —
          </textPath>
        </text>
      </g>
      <circle cx="50" cy="50" r="19" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.7" />
      <text x="50" y="53.5" textAnchor="middle" fontSize="12" fontFamily="Oswald, sans-serif" fill="currentColor">
        06
      </text>
    </svg>
  )
}

export default function Scene06Collage() {
  const { ref, progress } = useScrollProgress<HTMLElement>()
  const land = ss(progress, 0.86, 1)

  const enter = (start: number, end: number) => ss(progress, start, end)
  const fly = (a: number, x: number, y: number, r: number) => ({
    opacity: a,
    transform: `translate3d(${(1 - a) * x}vw, ${(1 - a) * y}vh, 0) rotate(${(1 - a) * r}deg)`,
  })

  return (
    <section
      id="plate-06"
      data-plate="6"
      data-theme="dark"
      ref={ref}
      className="scene"
      style={{ height: '320vh' }}
      aria-label="Plate 06, Collage"
    >
      <div className="scene__stage s6__stage">
        <div className="s6__backdrop" />
        <div className="s6__bignum" aria-hidden>
          06
        </div>

        <PlateHead n={6} title="Collage" right="A poster assembling itself" />

        <div className="s6__sheet-wrap">
          <div
            className="s6__sheet"
            style={{
              transform: `perspective(1600px) rotateX(${(1 - land) * 3}deg) rotateY(${-land * 5}deg) rotate(${
                -land * 1
              }deg) scale(${1 - land * 0.02})`,
            }}
          >
            <div className="s6__marks" aria-hidden />

            <div className="s6__piece s6__display" style={fly(enter(0, 0.1), 0, -20, 0)}>
              REF<span>LOW</span>
            </div>

            <div className="s6__piece s6__bars" style={fly(enter(0.03, 0.16), 16, 0, 6)}>
              <i />
              <i />
              <i />
            </div>

            <div className="s6__piece s6__photo" style={fly(enter(0.02, 0.16), -18, 4, -5)}>
              <img src="/images/editorial/doorway-01.jpg" alt="Figure in a lit doorway, cut-paper silhouette in two inks" />
            </div>

            <div className="s6__piece s6__photo2" style={fly(enter(0.14, 0.3), 16, 6, 5)}>
              <img src="/images/editorial/arches-01.jpg" alt="Arcade interior printed as a duotone" />
            </div>

            <div className="s6__piece s6__seal" style={fly(enter(0.26, 0.42), 6, -12, 26)}>
              <Seal rotation={progress * 34} />
            </div>

            <div className="s6__piece s6__strip" style={fly(enter(0.3, 0.44), -12, 0, 1.5)}>
              Form / Counterform / Reform / Form / Counterform / Reform / Form / Counterform / Reform / Form
            </div>

            <div className="s6__piece s6__serif" style={fly(enter(0.36, 0.54), 0, 14, -3)}>
              meaning is
              <br />
              an arrangement.
            </div>

            <div className="s6__piece s6__mono" style={fly(enter(0.44, 0.6), -6, 8, 0)}>
              Reflow — an experiment
              <br />
              in computational typography
              <br />
              Plate 06 of 07
            </div>

            <div className="s6__piece s6__barcode" style={fly(enter(0.5, 0.64), 8, 8, 0)}>
              <Barcode />
            </div>

            <div className="s6__piece s6__credits" style={fly(enter(0.54, 0.7), 8, 10, 0)}>
              Type / Oswald, Instrument Serif
              <br />
              Image / original two-ink duotone
              <br />
              Press / two inks on paper
            </div>
          </div>
        </div>

        <div className="s6__note lab lab--xs" style={{ opacity: ss(progress, 0.55, 0.72) }}>
          Composition / nine moves
          <br />
          Locked at 100%
        </div>
        <div className="s6__note2 lab lab--xs" style={{ opacity: ss(progress, 0.6, 0.78) }}>
          Next — the composition
          <br />
          Plate 07
        </div>
      </div>
    </section>
  )
}
