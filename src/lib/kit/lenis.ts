import Lenis from 'lenis'
import { gsap, ScrollTrigger, prefersReducedMotion } from './gsap'

let lenis: Lenis | null = null
const tick = (time: number) => lenis?.raf(time * 1000)

/** Smooth scroll, kept in sync with GSAP ScrollTrigger. Call once at app start. */
export function initLenis(): Lenis {
  if (lenis) return lenis
  // with reduced motion asked for, the wheel scrolls the page directly instead of gliding
  lenis = new Lenis({ smoothWheel: !prefersReducedMotion() })
  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add(tick)
  gsap.ticker.lagSmoothing(0)
  return lenis
}

export const getLenis = () => lenis

export function destroyLenis() {
  gsap.ticker.remove(tick)
  lenis?.destroy()
  lenis = null
}

/**
 * Smooth scroll for a scrolling box of its own (a full-screen view), so it glides like the page under it.
 * Returns the cleanup. Leaves the box to the browser when reduced motion is asked for.
 */
export function smoothBox(wrapper: HTMLElement, content: HTMLElement): () => void {
  if (prefersReducedMotion()) return () => {}
  const box = new Lenis({ wrapper, content, eventsTarget: wrapper })
  const raf = (time: number) => box.raf(time * 1000)
  gsap.ticker.add(raf)
  return () => {
    gsap.ticker.remove(raf)
    box.destroy()
  }
}
