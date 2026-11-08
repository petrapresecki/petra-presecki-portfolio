import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

/**
 * After mariamarago.com: a 15px white dot in difference blend that eases after the pointer, grows to 45px over
 * anything you can click and bounces on press. Over an element with [data-cursor] it grows further and prints that
 * word inside; over one with [data-peek] a still rides beside it. Desktop pointers only; touch keeps its own.
 */
export default function Cursor() {
  const dot = useRef<HTMLDivElement>(null)
  const word = useRef<HTMLSpanElement>(null)
  const peek = useRef<HTMLDivElement>(null)
  const img = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const fine = matchMedia('(hover: hover) and (pointer: fine) and (min-width: 1024px)')
    if (!fine.matches) return
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
    const root = document.documentElement
    root.classList.add('has-cursor')
    const d = dot.current!
    const p = peek.current!
    let [mx, my, cx, cy, px, py] = [0, 0, 0, 0, 0, 0]
    let first = true
    let raf = 0

    const move = (e: PointerEvent) => {
      mx = e.clientX
      my = e.clientY
      if (first) {
        ;[cx, cy, px, py] = [mx, my, mx, my]
        first = false
      }
      d.classList.add('is-on')
      over(e.target as Element)
    }
    // what the dot is over decides its size, its word and the still
    const over = (el: Element | null) => {
      const t = el?.closest?.('a, button, [data-cursor], [data-peek], [role="button"]')
      const label = t?.closest('[data-cursor]')?.getAttribute('data-cursor')
      d.classList.toggle('is-link', !!t && !label)
      d.classList.toggle('is-label', !!label)
      if (label) word.current!.textContent = label
      const still = t?.closest('[data-peek]')?.getAttribute('data-peek')
      if (still) {
        if (img.current!.getAttribute('src') !== still) img.current!.src = still
        p.classList.add('is-on')
      } else p.classList.remove('is-on')
    }
    const frame = () => {
      const k = reduce ? 1 : 0.25
      cx += (mx - cx) * k
      cy += (my - cy) * k
      px += (mx - px) * (reduce ? 1 : 0.12)
      py += (my - py) * (reduce ? 1 : 0.12)
      d.style.transform = `translate3d(${cx}px, ${cy}px, 0)`
      // the still sits up and to the right of the pointer, flipped left near the right edge
      const w = p.offsetWidth
      const x = px + 28 + w > innerWidth - 16 ? px - 28 - w : px + 28
      p.style.transform = `translate3d(${x}px, ${py - p.offsetHeight / 2}px, 0)`
      raf = requestAnimationFrame(frame)
    }
    const leave = () => {
      d.classList.remove('is-on')
      p.classList.remove('is-on')
    }
    const down = () => d.classList.add('is-down')
    const up = () => d.classList.remove('is-down')
    // a scroll moves the page under a still pointer: look again at what is under it
    const scroll = () => !first && over(document.elementFromPoint(mx, my))

    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('pointerdown', down)
    window.addEventListener('pointerup', up)
    window.addEventListener('scroll', scroll, { passive: true })
    root.addEventListener('pointerleave', leave)
    raf = requestAnimationFrame(frame)
    return () => {
      cancelAnimationFrame(raf)
      root.classList.remove('has-cursor')
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerdown', down)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('scroll', scroll)
      root.removeEventListener('pointerleave', leave)
    }
  }, [])

  // straight on <body>: inside the page's stacking context the difference blend would have nothing to invert
  return createPortal(
    <>
      <div ref={peek} className="c-peek" aria-hidden>
        <img ref={img} alt="" />
      </div>
      <div ref={dot} className="c-cursor" aria-hidden>
        <span ref={word} />
      </div>
    </>,
    document.body,
  )
}
