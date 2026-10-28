import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { prefersReducedMotion } from '@/lib/kit/gsap'

/**
 * A short looping film drawn in SVG on a 960 × 600 stage, so the same piece reads in a hover peek and across a
 * case page. It runs on its own clock while it plays, and holds one still frame for reduced motion.
 *
 * Every film speaks the same language, after asimorb.com: what matters (a value, a request, a partner, a step) is a
 * soft orb of light that drifts, travels and blends into another; how things connect is a dotted line that draws
 * itself; places are small nodes with a label; the one thing a person does is a ringed handle. One warm palette,
 * no hard boxes, and each loop ends where it began, so nothing blinks out between rounds.
 */

export const W = 960
export const H = 600

export const INK = 'var(--color-ink)'
export const PAPER = 'var(--color-paper)'
export const MUTED = 'var(--color-muted)'
export const RULE = 'var(--color-rule)'

/** the palette: Asim's coral, a peach and a pink; a warm grey for what's left out */
export const CORAL = '#fd7174'
export const PEACH = '#f7a072'
export const PINK = '#fdabd3'
export const GREY = '#c9c3b8'

const clamp01 = (x: number) => Math.min(1, Math.max(0, x))
export const easeOut = (x: number) => 1 - (1 - x) ** 3
export const easeInOut = (x: number) => (x < 0.5 ? 4 * x ** 3 : 1 - (-2 * x + 2) ** 3 / 2)
/** 0 before a, 1 after b, eased between */
export const ramp = (t: number, a: number, b: number, ease = easeInOut) => ease(clamp01((t - a) / (b - a)))
export const lerp = (a: number, b: number, p: number) => a + (b - a) * p

type Pt = readonly [number, number]

/** a point along a gentle curve from a to b, bent through c */
export const along = ([a, c, b]: readonly [Pt, Pt, Pt], p: number): Pt => [
  (1 - p) ** 2 * a[0] + 2 * (1 - p) * p * c[0] + p ** 2 * b[0],
  (1 - p) ** 2 * a[1] + 2 * (1 - p) * p * c[1] + p ** 2 * b[1],
]
/** the same curve as a path */
export const curve = ([a, c, b]: readonly [Pt, Pt, Pt]) => `M${a[0]},${a[1]} Q${c[0]},${c[1]} ${b[0]},${b[1]}`

/**
 * A slow wander, a few pixels each way, that comes back to where it started at the end of the loop so the seam
 * doesn't show. `k` gives each thing its own path.
 */
export const drift = (t: number, length: number, k: number, amp = 8): Pt => {
  const a = (t / length) * Math.PI * 2
  return [amp * Math.sin(a * (1 + (k % 2)) + k * 1.7), amp * 0.8 * Math.cos(a * (2 - (k % 2)) + k * 2.3)]
}

/** one colour into another, for things that take on a partner's colour */
export function mix(a: string, b: string, p: number) {
  const c = (h: string) => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16))
  const [x, y] = [c(a), c(b)]
  return `rgb(${x.map((v, i) => Math.round(lerp(v, y[i], clamp01(p)))).join(' ')})`
}

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
  const [t, setT] = useState(still)

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
    <svg
      ref={box}
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label={label}
      className="block h-auto w-full select-none"
      style={{ fontFamily: 'var(--font-sans)', isolation: 'isolate' }}
    >
      {children(t)}
    </svg>
  )
}

/**
 * A soft orb of light: a radial gradient that fades to nothing with no edge, multiplied onto the paper so two orbs
 * that meet blend into a deeper colour, as Asim's do.
 */
export function Orb({ at, r, color, strength = 1 }: { at: Pt; r: number; color: string; strength?: number }) {
  const id = useId()
  if (strength <= 0 || r <= 0) return null
  return (
    <g style={{ mixBlendMode: 'multiply' }}>
      <radialGradient id={id}>
        <stop offset="0" stopColor={color} stopOpacity={0.95 * strength} />
        <stop offset="0.3" stopColor={color} stopOpacity={0.7 * strength} />
        <stop offset="0.55" stopColor={color} stopOpacity={0.32 * strength} />
        <stop offset="0.8" stopColor={color} stopOpacity={0.08 * strength} />
        <stop offset="1" stopColor={color} stopOpacity={0} />
      </radialGradient>
      <circle cx={at[0]} cy={at[1]} r={r} fill={`url(#${id})`} />
    </g>
  )
}

/** A dotted line that draws itself from its start: `p` is how much of it is there */
export function Dotted({ d, p = 1, color = INK, opacity = 1, dash = 5 }: { d: string; p?: number; color?: string; opacity?: number; dash?: number }) {
  const id = useId()
  if (p <= 0) return null
  return (
    <g opacity={opacity}>
      {p < 1 && (
        <mask id={id} maskUnits="userSpaceOnUse" x={0} y={0} width={W} height={H}>
          <path d={d} fill="none" stroke="#fff" strokeWidth={10} pathLength={1} strokeDasharray={`${p} 2`} />
        </mask>
      )}
      <path d={d} fill="none" stroke={color} strokeWidth={2} strokeDasharray={`${dash} ${dash}`} mask={p < 1 ? `url(#${id})` : undefined} />
    </g>
  )
}

/** A place: a small dot, filled when it's in play and an empty dotted ring when it's left out, with its label */
export function Node({
  at,
  label,
  color = INK,
  on = 1,
  side = 'right',
}: {
  at: Pt
  label?: string
  color?: string
  /** 1 filled, 0 left out */
  on?: number
  side?: 'right' | 'left' | 'below' | 'above'
}) {
  const [x, y] = at
  const anchor = side === 'left' ? 'end' : side === 'right' ? 'start' : 'middle'
  const [lx, ly] = side === 'right' ? [x + 14, y + 5] : side === 'left' ? [x - 14, y + 5] : side === 'below' ? [x, y + 26] : [x, y - 16]
  return (
    <g>
      <circle cx={x} cy={y} r={7} fill="none" stroke={GREY} strokeWidth={1.5} strokeDasharray="2 3" opacity={1 - on} />
      <circle cx={x} cy={y} r={7 * (0.4 + 0.6 * on)} fill={color} opacity={on} />
      {label && (
        <text x={lx} y={ly} fontSize={16} fontWeight={600} letterSpacing={0.6} textAnchor={anchor} fill={INK} opacity={0.35 + 0.65 * on}>
          {label.toUpperCase()}
        </text>
      )}
    </g>
  )
}

/** Where a person or the system acts: a paper dot ringed in ink */
export const Handle = ({ at, r = 7 }: { at: Pt; r?: number }) => <circle cx={at[0]} cy={at[1]} r={r} fill={PAPER} stroke={INK} strokeWidth={2} />

/** A black tag of small capitals, like the page's own tags */
export function Tag({ at, text, opacity = 1, anchor = 'start' }: { at: Pt; text: string; opacity?: number; anchor?: 'start' | 'middle' | 'end' }) {
  const w = text.length * 9.6 + 20
  const x = anchor === 'start' ? at[0] : anchor === 'middle' ? at[0] - w / 2 : at[0] - w
  if (opacity <= 0) return null
  return (
    <g opacity={opacity}>
      <rect x={x} y={at[1] - 17} width={w} height={25} rx={3} fill={INK} />
      <text x={x + 10} y={at[1] + 1} fontSize={14} fontWeight={600} letterSpacing={0.7} fill={PAPER}>
        {text.toUpperCase()}
      </text>
    </g>
  )
}
