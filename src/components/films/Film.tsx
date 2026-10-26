import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
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
      // the first frame's timestamp can come before `from`, which would put t below zero
      setT((Math.max(0, now - from) / 1000) % length)
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

/**
 * The stripe mark's slats, across a box: bars on a fixed pitch, each as heavy as `weight` says (a number, or one
 * per bar for blinds that close one after another), and thinner inside `shape` where it's given.
 */
export function Slats({
  x,
  y,
  w,
  h,
  fill,
  pitch = 16,
  weight = 10,
  thin = 3,
  shape,
}: {
  x: number
  y: number
  w: number
  h: number
  fill: string
  pitch?: number
  weight?: number | ((i: number) => number)
  thin?: number
  /** drawn in white for a mask: where the slats turn thin */
  shape?: ReactNode
}) {
  const id = useId()
  const n = Math.ceil(h / pitch)
  const bars = (k: (i: number) => number) =>
    Array.from({ length: n }, (_, i) => {
      // closed slats overlap a hair, so no seam shows between them
      const height = k(i) >= pitch ? pitch + 1 : Math.max(0, k(i))
      return height > 0 ? <rect key={i} x={x} y={y + i * pitch + (pitch - height) / 2} width={w} height={height} /> : null
    })
  const k = typeof weight === 'number' ? () => weight : weight
  return (
    <g fill={fill}>
      <clipPath id={`${id}-box`}>
        <rect x={x} y={y} width={w} height={h} />
      </clipPath>
      {shape && (
        <>
          <mask id={`${id}-out`} maskUnits="userSpaceOnUse" x={x} y={y} width={w} height={h}>
            <rect x={x} y={y} width={w} height={h} fill="#fff" />
            <g fill="#000">{shape}</g>
          </mask>
          <mask id={`${id}-in`} maskUnits="userSpaceOnUse" x={x} y={y} width={w} height={h}>
            <g fill="#fff">{shape}</g>
          </mask>
        </>
      )}
      <g clipPath={`url(#${id}-box)`}>
        <g mask={shape ? `url(#${id}-out)` : undefined}>{bars(k)}</g>
        {shape && <g mask={`url(#${id}-in)`}>{bars(() => thin)}</g>}
      </g>
    </g>
  )
}
