import { useEffect, useRef, type ReactNode } from 'react'
import { getLenis } from '@/lib/kit/lenis'
import { gsap, prefersReducedMotion } from '@/lib/kit/gsap'
import { useSwipeClose } from '@/lib/close-gestures'

/**
 * A full-screen view over the page with its own scroll, laid on the same 12-column grid.
 * It fades in rising a few pixels, and fades out before it closes; on a phone it swipes away right or pulls down.
 */
export default function View({
  label,
  bar,
  onClose,
  next,
  children,
}: {
  label: string
  /** title bar contents, left to right, before the close button */
  bar: ReactNode
  onClose: () => void
  /** the next case or project, shown at the bottom */
  next?: { title: string; go: () => void }
  children: ReactNode
}) {
  const root = useRef<HTMLDivElement>(null)
  const leaving = useRef(false)
  const close = useRef(() => {})
  close.current = () => {
    if (leaving.current) return
    leaving.current = true
    if (prefersReducedMotion()) return onClose()
    gsap.to(root.current, { autoAlpha: 0, y: 8, duration: 0.2, ease: 'power2.in', onComplete: onClose })
  }

  useSwipeClose(root, onClose)

  useEffect(() => {
    getLenis()?.stop()
    root.current?.focus()
    if (!prefersReducedMotion()) {
      gsap.fromTo(root.current, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.35, ease: 'power2.out' })
    }
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
      className="fixed inset-0 z-[70] overflow-y-auto overscroll-y-contain bg-paper outline-none"
    >
      <div className="grid-12 sticky top-0 z-10 items-baseline gap-y-1 bg-paper/90 py-3 backdrop-blur-sm rule-bottom">
        {bar}
        <button className="link col-span-3 col-start-10 justify-self-end md:col-span-1 md:col-start-12" onClick={() => close.current()}>
          Close <span className="text-muted max-md:hidden">Esc</span>
        </button>
      </div>
      {children}
      {next && (
        <button onClick={next.go} className="grid-12 mt-24 w-full py-5 text-left rule-top">
          <span className="label col-span-12 md:col-span-3">Next</span>
          <span className="statement link col-span-12 md:col-[4/span_9]">{next.title} →</span>
        </button>
      )}
      <div className="h-16" />
    </div>
  )
}
