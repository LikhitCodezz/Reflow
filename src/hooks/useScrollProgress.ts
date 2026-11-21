import { useEffect, useRef, useState } from 'react'

/**
 * Scroll progress for a pinned scene.
 * 0 when the section top reaches the top of the viewport,
 * 1 when the section bottom reaches the bottom of the viewport.
 * The same mechanism drives the page in both directions.
 */
export function useScrollProgress<T extends HTMLElement = HTMLElement>() {
  const ref = useRef<T>(null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    let raf = 0
    let last = -1

    const update = () => {
      raf = 0
      const rect = el.getBoundingClientRect()
      const span = Math.max(1, rect.height - window.innerHeight)
      const p = Math.min(1, Math.max(0, -rect.top / span))
      el.style.setProperty('--p', p.toFixed(4))
      if (Math.abs(p - last) > 0.0015) {
        last = p
        setProgress(Number(p.toFixed(3)))
      }
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

  return { ref, progress }
}
