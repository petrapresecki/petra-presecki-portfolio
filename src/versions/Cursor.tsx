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
    // easing by elapsed time, not per frame: on a heavy page the frames thin out and a per-frame ease left the dot
    // trailing far behind the pointer, so a click landed somewhere the dot had not reached yet
    let last = performance.now()
    const frame = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000)
      last = now
      const k = reduce ? 1 : 1 - Math.exp(-dt * 30)
      const kp = reduce ? 1 : 1 - Math.exp(-dt * 8)
      cx += (mx - cx) * k
      cy += (my - cy) * k
      d.style.translate = `calc(${cx}px - 50%) calc(${cy}px - 50%)`
      // the still sits up and to the right of the pointer, flipped left near the right edge; measured only while shown
      if (p.classList.contains('is-on')) {
        px += (mx - px) * kp
        py += (my - py) * kp
        const w = p.offsetWidth
        const x = px + 28 + w > innerWidth - 16 ? px - 28 - w : px + 28
        p.style.transform = `translate3d(${x}px, ${py - p.offsetHeight / 2}px, 0)`
      } else [px, py] = [mx, my]
      raf = requestAnimationFrame(frame)
    }
    const leave = () => {
      d.classList.remove('is-on')
      p.classList.remove('is-on')
    }
    // a press lands where the pointer is: bring the dot there at once so it never slides to the spot after the click
    const down = (e: PointerEvent) => {
      ;[mx, my, cx, cy] = [e.clientX, e.clientY, e.clientX, e.clientY]
      d.style.translate = `calc(${cx}px - 50%) calc(${cy}px - 50%)`
      d.classList.add('is-down')
    }
    // a scroll moves the page under a still pointer, a click opens a view under it: look again at what is under it
    const recheck = () => !first && over(document.elementFromPoint(mx, my))
    const up = () => {
      d.classList.remove('is-down')
      // after the click's render has landed
      requestAnimationFrame(() => requestAnimationFrame(recheck))
    }
    const cancel = () => d.classList.remove('is-down')
    // Firefox ignores -webkit-user-drag; a native drag freezes the dot and brings back the system cursor
    const drag = (e: DragEvent) => {
      if ((e.target as Element)?.closest?.('a, img')) e.preventDefault()
    }

    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('pointerdown', down)
    window.addEventListener('pointerup', up)
    window.addEventListener('pointercancel', cancel)
    window.addEventListener('blur', cancel)
    window.addEventListener('dragstart', drag)
    window.addEventListener('scroll', recheck, { passive: true, capture: true })
    root.addEventListener('pointerleave', leave)
    raf = requestAnimationFrame(frame)
    return () => {
      cancelAnimationFrame(raf)
      root.classList.remove('has-cursor')
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerdown', down)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', cancel)
      window.removeEventListener('blur', cancel)
      window.removeEventListener('dragstart', drag)
      window.removeEventListener('scroll', recheck, { capture: true })
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
