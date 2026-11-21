import SignatureMark from '../components/SignatureMark'

/**
 * The last leaf of the exhibition. It repeats the plates' running folio and
 * carries the imprint, so the author's mark reads as the close of the
 * composition rather than a section appended to it.
 */
export default function Scene07Colophon() {
  return (
    <section
      id="colophon"
      data-plate="7"
      data-theme="dark"
      className="sig"
      aria-label="Colophon and author signature"
    >
      <div className="sig__leaf">
        <div className="plate-head">
          <div className="plate-head__l lab">
            <span className="plate-head__n">07</span>
            <span>Colophon</span>
          </div>
          <div className="plate-head__r lab">The Composition / end</div>
        </div>

        <div className="sig__mark-wrap">
          <SignatureMark />
        </div>

        <div className="sig__rule" aria-hidden />

        <div className="colophon">
          <div>
            Reflow — an experiment
            <br />
            in computational typography
          </div>
          <div>Seven plates / one engine / two inks</div>
          <div>
            Instrument Serif × Oswald
            <br />
            Plate 07 of 07 — end
          </div>
        </div>
      </div>
    </section>
  )
}
