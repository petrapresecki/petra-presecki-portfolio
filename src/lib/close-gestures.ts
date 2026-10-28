import { useEffect, useRef, type RefObject } from 'react'
import { gsap, prefersReducedMotion } from '@/lib/kit/gsap'

/**
 * Touch gestures that close a full-screen view: swipe it off to the right, or pull it down while it's scrolled to the top.
 * The view follows the finger; let go past a third of the way, or with a flick, and it carries on out, else it springs back.
 */
export function useSwipeClose(root: RefObject<HTMLElement | null>, onClose: () => void) {
  const close = useRef(onClose)
  close.current = onClose

  useEffect(() => {
    const el = root.current
    if (!el) return
    let start: { x: number; y: number } | null = null
    let axis: 'x' | 'y' | null = null
    let d = 0
    let v = 0
    let last = { d: 0, t: 0 }

    const begin = (e: TouchEvent) => {
      start = null
      if (e.touches.length !== 1 || (e.target as Element).closest('input, textarea, [data-no-swipe]')) return
      const t = e.touches[0]
      start = { x: t.clientX, y: t.clientY }
      axis = null
      d = v = 0
      last = { d: 0, t: e.timeStamp }
    }
    const move = (e: TouchEvent) => {
      if (!start) return
      if (e.touches.length !== 1) return void (axis && settle(false))
      const t = e.touches[0]
      const dx = t.clientX - start.x
      const dy = t.clientY - start.y
      if (!axis) {
        if (Math.hypot(dx, dy) < 10) return
        // a sideways swipe to the right, or a pull down that would otherwise only bounce the top; anything else is a scroll
        if (dx > 0 && dx > Math.abs(dy) * 1.5) axis = 'x'
        else if (dy > 0 && dy > Math.abs(dx) && el.scrollTop <= 0) axis = 'y'
        else return void (start = null)
      }
      e.preventDefault()
      d = Math.max(0, axis === 'x' ? dx : dy)
      const dt = e.timeStamp - last.t
      if (dt > 0) v = (d - last.d) / dt
      last = { d, t: e.timeStamp }
      gsap.set(el, { [axis]: d })
    }
    const end = () => {
      if (!start || !axis) return void (start = null)
      const size = axis === 'x' ? innerWidth : innerHeight
      settle(d > size / 3 || v > 0.5)
    }
    const settle = (out: boolean) => {
      const a = axis!
      start = axis = null
      if (out && prefersReducedMotion()) return close.current()
      if (out) gsap.to(el, { [a]: a === 'x' ? innerWidth : innerHeight, duration: 0.25, ease: 'power2.in', onComplete: () => close.current() })
      else gsap.to(el, { [a]: 0, duration: 0.35, ease: 'power3.out' })
    }

    el.addEventListener('touchstart', begin, { passive: true })
    el.addEventListener('touchmove', move, { passive: false })
    el.addEventListener('touchend', end)
    el.addEventListener('touchcancel', end)
    return () => {
      el.removeEventListener('touchstart', begin)
      el.removeEventListener('touchmove', move)
      el.removeEventListener('touchend', end)
      el.removeEventListener('touchcancel', end)
    }
  }, [root])
}

/**
 * Gives an open view its own history entry, so the phone's back swipe, the back button or a two-finger trackpad swipe
 * closes the view instead of leaving the site. Closing it any other way takes the entry back off.
 */
export function useBackCloses(open: boolean, onBack: () => void) {
  const back = useRef(onBack)
  back.current = onBack
  const isOpen = useRef(open)
  isOpen.current = open

  useEffect(() => {
    if (!open) return
    if (!history.state?.view) history.pushState({ view: true }, '')
    const pop = () => back.current()
    addEventListener('popstate', pop)
    return () => {
      removeEventListener('popstate', pop)
      // on the next tick, so a remount (Strict Mode, or one view swapped for the next) keeps the entry it already has
      setTimeout(() => !isOpen.current && history.state?.view && history.back())
    }
  }, [open])
}
