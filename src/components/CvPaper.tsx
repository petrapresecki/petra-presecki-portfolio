import { useEffect, useRef } from 'react'
import { getLenis } from '@/lib/kit/lenis'
import { gsap, prefersReducedMotion } from '@/lib/kit/gsap'
import { view } from '@/lib/close-gestures'
import { edition, person } from '@/data/site'

/** The page images come from the printed PDF (`pnpm cv`, `pnpm cv --grid` or `pnpm cv --clean`), so the paper is exactly what you download. */
const PAGES = ['/cv/page-1.jpg', '/cv/page-2.jpg']
const GRID_PAGES = ['/cv/grid/page-1.jpg', '/cv/grid/page-2.jpg']
const CLEAN_PAGES = edition.cv.pages
export const GRID_CV = '/Petra-Presecki-CV-Grid.pdf'
export const CLEAN_CV = edition.cv.pdf
const W = 794
const H = 1123

/**
 * The CV as one sheet of paper: page one on the front, page two on the back.
 * Drag to turn it over (it keeps a little momentum), scroll or pinch to zoom, double-click or arrow keys to flip;
 * pinching it smaller than it fits closes it.
 */
export default function CvPaper({ onClose }: { onClose: () => void }) {
  const version = document.documentElement.dataset.version
  const [pages, pdf] = version === 'clean' ? [CLEAN_PAGES, CLEAN_CV] : version === 'grid' ? [GRID_PAGES, GRID_CV] : [PAGES, person.cv]
  const root = useRef<HTMLDivElement>(null)
  const sheet = useRef<HTMLDivElement>(null)
  const shadow = useRef<HTMLDivElement>(null)
  // the close with its fade, kept current so the effect below needn't rerun when the parent hands a new onClose
  const leaving = useRef(false)
  const mounted = useRef(false)
  const close = useRef(() => {})
  close.current = () => {
    if (leaving.current) return
    leaving.current = true
    if (prefersReducedMotion()) return onClose()
    gsap.to(root.current, { opacity: 0, duration: 0.25, ease: 'power2.in', onComplete: onClose })
    // a hidden tab gets no animation frames, so the fade may never finish: close anyway
    setTimeout(() => mounted.current && onClose(), 400)
  }
  const st = useRef({ ry: -16, rx: 10, vy: 0, vx: 0, zoom: 1, drag: null as null | { x: number; y: number }, target: null as null | number })

  useEffect(() => {
    getLenis()?.stop()
    mounted.current = true
    root.current?.focus()
    const s = st.current
    const reduce = prefersReducedMotion()
    if (!reduce) gsap.fromTo(root.current, { opacity: 0 }, { opacity: 1, duration: 0.35, ease: 'power2.out' })
    const closing = () => close.current()
    view.close = closing
    let raf = 0
    let last = performance.now()
    const fit = () => Math.min((innerHeight - 140) / H, (innerWidth - 32) / W)
    const frame = (now: number) => {
      // the easing was tuned per frame at 60Hz: scale it by the time that really passed, so a 120Hz screen turns it at the same pace
      const f = Math.min(6, ((now - last) / 1000) * 60)
      last = now
      const ease = (k: number) => 1 - Math.pow(1 - k, f)
      if (!s.drag) {
        if (s.target !== null) {
          s.ry += (s.target - s.ry) * (reduce ? 1 : ease(0.14))
          if (Math.abs(s.target - s.ry) < 0.1) s.target = null
        } else {
          s.ry += s.vy * f
          s.vy *= Math.pow(0.93, f)
        }
        s.rx += (4 - s.rx) * ease(0.05)
      }
      s.rx = Math.max(-35, Math.min(35, s.rx))
      const scale = fit() * s.zoom
      const turn = Math.cos((s.ry * Math.PI) / 180)
      if (sheet.current) sheet.current.style.transform = `scale(${scale}) rotateX(${s.rx}deg) rotateY(${s.ry}deg)`
      if (shadow.current) {
        shadow.current.style.width = `${W * scale}px`
        shadow.current.style.transform = `translate(-50%, ${(H * scale) / 2}px) scaleX(${Math.max(0.08, Math.abs(turn))})`
      }
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    // flip to whichever side is facing away, landing square on the page
    const flip = () => (s.target = Math.round(s.ry / 180) * 180 + 180)
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close.current()
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft' || e.key === ' ') {
        e.preventDefault()
        flip()
      }
    }
    window.addEventListener('keydown', key)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('keydown', key)
      if (view.close === closing) view.close = null
      gsap.killTweensOf(root.current)
      getLenis()?.start()
      mounted.current = false
    }
  }, [])

  // pointer: one finger or the mouse turns the sheet, two fingers zoom it
  const pts = useRef(new Map<number, PointerEvent>())
  const pinch = useRef({ d: 0, z: 1 })
  const down = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('a,button')) return
    e.currentTarget.setPointerCapture(e.pointerId)
    pts.current.set(e.pointerId, e.nativeEvent)
    const s = st.current
    if (pts.current.size === 2) {
      const [a, b] = [...pts.current.values()]
      pinch.current = { d: Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY), z: s.zoom }
      s.drag = null
      return
    }
    s.drag = { x: e.clientX, y: e.clientY }
    s.target = null
  }
  const move = (e: React.PointerEvent) => {
    const s = st.current
    if (pts.current.has(e.pointerId)) pts.current.set(e.pointerId, e.nativeEvent)
    if (pts.current.size === 2) {
      const [a, b] = [...pts.current.values()]
      s.zoom = clampZoom((pinch.current.z * Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY)) / pinch.current.d)
      return
    }
    if (!s.drag) return
    s.vy = (e.clientX - s.drag.x) * 0.4
    s.ry += s.vy
    s.rx -= (e.clientY - s.drag.y) * 0.25
    s.drag = { x: e.clientX, y: e.clientY }
  }
  const up = (e: React.PointerEvent) => {
    // pinched right down past where it fits, the paper puts itself away, like a photo
    if (pts.current.size === 2 && st.current.zoom < 0.7) return close.current()
    pts.current.delete(e.pointerId)
    if (!pts.current.size) st.current.drag = null
  }

  return (
    <div
      ref={root}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-label="CV, two pages"
      data-lenis-prevent
      className="cv-paper fixed inset-0 z-[80] outline-none"
    >
      <div className="grid-12 relative z-10 items-baseline py-3">
        <p className="col-span-6 md:col-span-3">
          CV <span className="text-muted max-md:hidden">· two pages, turn it over</span>
        </p>
        <a className="link col-span-6 justify-self-end md:col-span-3 md:col-start-4 md:justify-self-start" href={pdf} download>
          Download PDF ↓
        </a>
        <button className="link col-span-12 justify-self-end max-md:hidden md:col-span-1 md:col-start-12" onClick={() => close.current()}>
          Close <span className="text-muted">Esc</span>
        </button>
      </div>
      <div
        className="cv-stage absolute inset-0 cursor-grab touch-none select-none active:cursor-grabbing"
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
        onDoubleClick={() => (st.current.target = Math.round(st.current.ry / 180) * 180 + 180)}
        onWheel={e => (st.current.zoom = clampZoom(st.current.zoom * Math.exp(-e.deltaY * (e.ctrlKey ? 0.01 : 0.0015))))}
      >
        <div ref={shadow} className="cv-shadow" />
        <div ref={sheet} className="cv-sheet">
          {pages.map((src, i) => (
            <img key={src} src={src} alt={`CV, page ${i + 1} of 2`} draggable={false} className={i ? 'cv-face cv-back' : 'cv-face'} />
          ))}
        </div>
      </div>
      <button className="link absolute right-[var(--margin)] bottom-5 z-10 md:hidden" onClick={() => close.current()}>
        Close
      </button>
    </div>
  )
}

const clampZoom = (z: number) => Math.max(0.6, Math.min(2.6, z))
