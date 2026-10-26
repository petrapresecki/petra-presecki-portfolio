import { useEffect, useRef, useState, type ReactNode } from 'react'
import { prefersReducedMotion } from '@/lib/kit/gsap'

/**
 * A short looping film drawn in SVG on a 960 × 600 stage, so the same piece reads in a hover peek and across a
 * case page. It runs on its own clock while it plays, and holds one still frame for reduced motion.
 */

export const W = 960
export const H = 600

export const INK = 'var(--color-ink)'
export const PAPER = 'var(--color-paper)'
export const MUTED = 'var(--color-muted)'
export const RULE = 'var(--color-rule)'

const clamp01 = (x: number) => Math.min(1, Math.max(0, x))
export const easeOut = (x: number) => 1 - (1 - x) ** 3
export const easeInOut = (x: number) => (x < 0.5 ? 4 * x ** 3 : 1 - (-2 * x + 2) ** 3 / 2)
/** 0 before a, 1 after b, eased between */
export const ramp = (t: number, a: number, b: number, ease = easeOut) => ease(clamp01((t - a) / (b - a)))
export const lerp = (a: number, b: number, p: number) => a + (b - a) * p

export function Film({
  length,
  still,
  play,
  label,
  children,
}: {
  /** seconds in one loop */
  length: number
  /** the moment shown with reduced motion */
  still: number
  /** true/false from outside, or 'view' to play while on screen */
  play: boolean | 'view'
  label: string
  children: (t: number) => ReactNode
}) {
  const box = useRef<SVGSVGElement>(null)
  const [inView, setInView] = useState(false)
  const [t, setT] = useState(0)

  useEffect(() => {
    if (play !== 'view') return
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.25 })
    io.observe(box.current!)
    return () => io.disconnect()
  }, [play])

  const on = play === 'view' ? inView : play
  useEffect(() => {
    if (prefersReducedMotion()) return setT(still)
    if (!on) return
    const from = performance.now()
    let raf = requestAnimationFrame(function tick(now) {
      setT(((now - from) / 1000) % length)
      raf = requestAnimationFrame(tick)
    })
    return () => cancelAnimationFrame(raf)
  }, [on, length, still])

  return (
    <svg ref={box} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label} className="block h-auto w-full select-none" style={{ fontFamily: 'var(--font-sans)' }}>
      {children(t)}
    </svg>
  )
}

/** the site's tiny capitals, at stage size */
export function Cap({ children, fill = INK, size = 13, ...rest }: React.SVGProps<SVGTextElement> & { size?: number }) {
  return (
    <text fontSize={size} fontWeight={500} letterSpacing={0.3} fill={fill} {...rest}>
      {children}
    </text>
  )
}

/** a black bar with capitals on it, as the page's tags and section bars are */
export function Bar({ x, y, text, w, anchor = 'start' }: { x: number; y: number; text: string; w?: number; anchor?: 'start' | 'end' }) {
  const width = w ?? text.length * 8.6 + 14
  const left = anchor === 'end' ? x - width : x
  return (
    <g>
      <rect x={left} y={y - 14} width={width} height={20} fill={INK} />
      <Cap x={left + 7} y={y} fill={PAPER}>
        {text}
      </Cap>
    </g>
  )
}
