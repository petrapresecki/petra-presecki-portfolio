import { useEffect, useRef, type ReactNode } from 'react'
import { getLenis } from '@/lib/kit/lenis'
import { gsap, prefersReducedMotion } from '@/lib/kit/gsap'

/**
 * Grid's full-screen view for a case or a side project: the see-through bar of tiny capitals, the page on its
 * own scroll, and the next one at the bottom set as a title. Fades in, and out before it closes; Esc closes.
 */
export default function GridView({
  label,
  bar,
  onClose,
  next,
  children,
}: {
  label: string
  /** the bar's left and middle, before Close */
  bar: ReactNode
  onClose: () => void
  next: { label: string; title: string; go: () => void }
  children: ReactNode
}) {
  const root = useRef<HTMLDivElement>(null)
  const leaving = useRef(false)
  const close = useRef(() => {})
  close.current = () => {
    if (leaving.current) return
    leaving.current = true
    if (prefersReducedMotion()) return onClose()
    gsap.to(root.current, { autoAlpha: 0, duration: 0.2, ease: 'power2.in', onComplete: onClose })
  }

  useEffect(() => {
    getLenis()?.stop()
    root.current?.focus()
    if (!prefersReducedMotion()) gsap.fromTo(root.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3, ease: 'power2.out' })
    const key = (e: KeyboardEvent) => e.key === 'Escape' && close.current()
    window.addEventListener('keydown', key)
    return () => {
      window.removeEventListener('keydown', key)
      gsap.killTweensOf(root.current)
      getLenis()?.start()
    }
  }, [])

  return (
    <div
      ref={root}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-label={label}
      data-lenis-prevent
      className="fixed inset-0 z-[70] overflow-y-auto overscroll-contain bg-paper outline-none"
    >
      <header className="grid-bar">
        <div className="grid-12 items-center py-2.5">
          {bar}
          <button className="cap link col-span-4 col-start-9 justify-self-end md:col-span-2 md:col-start-11" onClick={() => close.current()}>
            Close <span className="max-md:hidden">Esc</span>
          </button>
        </div>
      </header>
      {children}
      <button onClick={next.go} className="grid-12 mt-24 w-full rule-top pt-3 pb-16 text-left">
        <span className="cap col-span-12 md:col-span-6">/ {next.label} /</span>
        <span className="title-l link col-span-12 mt-3 md:col-span-6 md:mt-0">{next.title} ↘</span>
      </button>
    </div>
  )
}

/** One part of a case or project: a rule across, the tag bar coming in from the page edge, the text beside it */
export function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <section className="case-row grid grid-cols-6 gap-x-[var(--gap)] pt-1 pb-8">
      <h3 className="col-span-6 md:col-span-2">
        <span className="tag-bleed">{label}</span>
      </h3>
      <div className="read col-span-6 mt-3 md:col-span-4 md:mt-1">{children}</div>
    </section>
  )
}

/** Numbered points in a row: /1.1, /1.2 */
export function Points({ n, items }: { n: number; items: string[] }) {
  return (
    <ol className="space-y-3">
      {items.map((item, k) => (
        <li key={item} className="grid grid-cols-[2.75em_1fr]">
          <span className="cap pt-[0.3em] text-muted">
            /{n}.{k + 1}
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ol>
  )
}
