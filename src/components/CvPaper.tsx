import { useEffect, useRef } from 'react'
import { getLenis } from '@/lib/kit/lenis'
import { prefersReducedMotion } from '@/lib/kit/gsap'
import { person } from '@/data/site'

/** The page images come from the printed PDF (`pnpm cv`, or `pnpm cv --grid` for the Grid version), so the paper is exactly what you download. */
const PAGES = ['/cv/page-1.jpg', '/cv/page-2.jpg']
const GRID_PAGES = ['/cv/grid/page-1.jpg', '/cv/grid/page-2.jpg']
export const GRID_CV = '/Petra-Presecki-CV-Grid.pdf'
const W = 794
const H = 1123

/**
 * The CV as one sheet of paper: page one on the front, page two on the back.
 * Drag to turn it over (it keeps a little momentum), scroll or pinch to zoom, double-click or arrow keys to flip.
 */
export default function CvPaper({ onClose }: { onClose: () => void }) {
  const grid = document.documentElement.dataset.version === 'grid'
  const pages = grid ? GRID_PAGES : PAGES
  const root = useRef<HTMLDivElement>(null)
  const sheet = useRef<HTMLDivElement>(null)
  const shadow = useRef<HTMLDivElement>(null)
  const st = useRef({ ry: -16, rx: 10, vy: 0, vx: 0, zoom: 1, drag: null as null | { x: number; y: number }, target: null as null | number })

  useEffect(() => {
    getLenis()?.stop()
    root.current?.focus()
    const s = st.current
    const reduce = prefersReducedMotion()
    let raf = 0
    const fit = () => Math.min((innerHeight - 140) / H, (innerWidth - 32) / W)
    const frame = () => {
      if (!s.drag) {
        if (s.target !== null) {
          s.ry += (s.target - s.ry) * (reduce ? 1 : 0.14)
          if (Math.abs(s.target - s.ry) < 0.1) s.target = null
        } else {
          s.ry += s.vy
          s.vy *= 0.93
        }
        s.rx += (4 - s.rx) * 0.05
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
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft' || e.key === ' ') {
        e.preventDefault()
        flip()
      }
    }
    window.addEventListener('keydown', key)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('keydown', key)
      getLenis()?.start()
    }
  }, [onClose])

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
        <a className="link col-span-6 justify-self-end md:col-span-3 md:col-start-4 md:justify-self-start" href={grid ? GRID_CV : person.cv} download>
          Download PDF ↓
        </a>
        <button className="link col-span-12 justify-self-end max-md:hidden md:col-span-1 md:col-start-12" onClick={onClose}>
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
      <button className="link absolute right-[var(--margin)] bottom-5 z-10 md:hidden" onClick={onClose}>
        Close
      </button>
    </div>
  )
}

const clampZoom = (z: number) => Math.max(0.6, Math.min(2.6, z))
