import { useEffect, useState } from 'react'
import { PLATES } from '../../lib/plates'
import { pad2 } from '../../lib/anim'
import { useReducedMotion } from '../../hooks/useReducedMotion'

export default function Chrome() {
  const [plate, setPlate] = useState(1)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [pct, setPct] = useState(0)
  const reduced = useReducedMotion()

  useEffect(() => {
    let raf = 0
    const update = () => {
      raf = 0
      const mid = window.innerHeight / 2
      const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-plate]'))
      let found: HTMLElement | undefined
      for (const s of sections) {
        const r = s.getBoundingClientRect()
        if (r.top <= mid && r.bottom > mid) {
          found = s
          break
        }
      }
      if (found) {
        const n = Number(found.dataset.plate)
        if (Number.isFinite(n)) setPlate(n)
        setTheme(found.dataset.theme === 'dark' ? 'dark' : 'light')
      }
      const max = document.documentElement.scrollHeight - window.innerHeight
      setPct(max > 0 ? Math.min(100, Math.round((window.scrollY / max) * 100)) : 0)
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  // Direct entry through a section hash: the plates mount after the browser's
  // own anchor pass, so honour the hash once the page is composed.
  useEffect(() => {
    const id = window.location.hash.slice(1)
    if (!id) return
    document.getElementById(id)?.scrollIntoView({ block: 'start' })
  }, [])

  const goto = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' })
  }

  const current = PLATES[plate - 1] ?? PLATES[0]

  return (
    <aside className="chrome" data-theme={theme} aria-label="Exhibition navigation">
      <div className="chrome__top">
        <div className="chrome__brand">
          <a className="chrome__logo" href="#plate-01">
            <img className="chrome__mark" src="/favicon.png" alt="" aria-hidden />
            REFLOW
          </a>
          <span className="chrome__sub">An experiment in computational typography</span>
        </div>
        <div className="chrome__plate">
          <b>Plate</b>
          <em>{pad2(current.n)}</em>
          <span>/ {pad2(PLATES.length)}</span>
          <span style={{ opacity: 0.6 }}>{current.title}</span>
        </div>
      </div>

      <nav className="chrome__rail" aria-label="Plates">
        {PLATES.map((p) => (
          <button
            key={p.n}
            className="chrome__tick"
            data-active={p.n === plate}
            onClick={() => goto(p.id)}
            aria-label={`Plate ${pad2(p.n)} — ${p.title}`}
          >
            <span>
              {pad2(p.n)} {p.title}
            </span>
            <i />
          </button>
        ))}
      </nav>

      <div className="chrome__bottom">
        <span>Scroll</span>
        <div className="chrome__bar">
          <i style={{ width: `${pct}%` }} />
        </div>
        <span>{pad2(pct)} / 100</span>
      </div>

      <span className="chrome__corner chrome__corner--tr" />
      <span className="chrome__corner chrome__corner--bl" />
    </aside>
  )
}
