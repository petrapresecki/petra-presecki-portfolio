import { createContext, useContext, useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { prefersReducedMotion } from '@/lib/kit/gsap'

/**
 * A short looping film drawn in SVG on a 960 × 600 stage, so the same piece reads in a hover peek and across a
 * case page. It runs on its own clock while it plays, and holds one still frame for reduced motion.
 *
 * Every film speaks the same language, after asimorb.com: what matters (a value, a request, a partner, a step) is a
 * soft orb of light that drifts, travels and blends into another; how things connect is a dotted line that draws
 * itself; places are small nodes with a label; the one thing a person does is a ringed handle; and the point being
 * made hangs off where it happens, a dotted line running to a soft panel. One warm palette, each case leading with one
 * of its colours, no hard boxes, and each loop ends where it began, so nothing blinks out between rounds.
 */

export const W = 960
export const H = 600

export const INK = 'var(--color-ink)'
export const PAPER = 'var(--color-paper)'
export const MUTED = 'var(--color-muted)'
export const RULE = 'var(--color-rule)'

/** the palette, the same as the home page's light: Asim's coral, a peach, a pink and a lilac; a warm grey for what's left out */
export const CORAL = '#fd7174'
export const PEACH = '#f7a072'
export const PINK = '#fdabd3'
export const LILAC = '#c3a6f0'
export const GREY = '#c9c3b8'

/** each case's own colour, as each part of asimorb.com has one: it leads in its film and marks it in the case bar */
export const LEAD = { theme: CORAL, flows: PEACH, sdk: PINK, agent: LILAC } as const

/**
 * Which look the films are drawn in. 'current' is the asimorb.com light above; 'thermal' is the proposal after a
 * thermal-specimen motion study: every orb becomes a heat reading (its strength is its heat, so a strong one burns
 * through orange and blue to a yellow core), tags and labels go mono on a lime highlight, places become pills, and the
 * frame carries specimen labels and a running counter. Set it from outside with <FilmLook.Provider>.
 */
export type Look = { look: 'current' | 'thermal'; n?: number; name?: string; lead?: string }
export const FilmLook = createContext<Look>({ look: 'current' })
const HeatId = createContext('')
const useLook = () => useContext(FilmLook)

/** the thermal ramp, from cold (the case's own colour, faint) to hot (yellow), eleven steps for an SVG table */
const LIME = '#eef7a4'
const BLUE = '#5d6bff'
const MONO = { fontFamily: 'var(--font-mono)' } as const
const HOT = '#fff23d'
function heatRamp(lead: string) {
  const light = mix(lead, '#ffffff', 0.55)
  const stops = [light, light, light, lead, '#f0785a', '#9a6fe0', BLUE, '#a9b4ff', '#f4c4dc', '#fbe58a', HOT]
  const ch = (k: number) => stops.map(c => (c.startsWith('rgb') ? Number(c.slice(4, -1).split(' ')[k]) : parseInt(c.slice(1 + k * 2, 3 + k * 2), 16)) / 255)
  return { r: ch(0), g: ch(1), b: ch(2), a: [0, 0.22, 0.45, 0.7, 0.85, 0.95, 1, 1, 1, 1, 1] }
}

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

  const look = useLook()
  const heat = useId().replace(/:/g, '')
  const thermal = look.look === 'thermal'

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
      {thermal && <HeatFilter id={heat} lead={look.lead ?? CORAL} />}
      <HeatId.Provider value={heat}>{children(t)}</HeatId.Provider>
      {thermal && <Specimen t={t} n={look.n ?? 1} name={look.name ?? label} />}
    </svg>
  )
}

/**
 * A soft orb of light: a radial gradient that fades to nothing with no edge, multiplied onto the paper so two orbs
 * that meet blend into a deeper colour, as Asim's do.
 */
export function Orb({ at, r, color, strength = 1 }: { at: Pt; r: number; color: string; strength?: number }) {
  const id = useId()
  const heat = useContext(HeatId)
  const thermal = useLook().look === 'thermal'
  if (strength <= 0 || r <= 0) return null
  if (thermal) {
    // a heat reading: white intensity that the film's heat filter maps onto the thermal ramp
    const s = Math.min(1, strength)
    return (
      <g filter={`url(#${heat})`} style={{ mixBlendMode: 'multiply' }} opacity={0.9}>
        <radialGradient id={id}>
          <stop offset="0" stopColor="#fff" stopOpacity={0.95 * s} />
          <stop offset="0.14" stopColor="#fff" stopOpacity={0.72 * s} />
          <stop offset="0.3" stopColor="#fff" stopOpacity={0.42 * s} />
          <stop offset="0.6" stopColor="#fff" stopOpacity={0.2 * s} />
          <stop offset="1" stopColor="#fff" stopOpacity={0} />
        </radialGradient>
        <circle cx={at[0]} cy={at[1]} r={r * 0.92} fill={`url(#${id})`} />
      </g>
    )
  }
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
  const thermal = useLook().look === 'thermal'
  if (p <= 0) return null
  if (thermal) [dash, opacity] = [2, opacity * 0.7]
  return (
    <g opacity={opacity}>
      {p < 1 && (
        <mask id={id} maskUnits="userSpaceOnUse" x={0} y={0} width={W} height={H}>
          <path d={d} fill="none" stroke="#fff" strokeWidth={10} pathLength={1} strokeDasharray={`${p} 2`} />
        </mask>
      )}
      <path d={d} fill="none" stroke={color} strokeWidth={thermal ? 1.5 : 2} strokeDasharray={thermal ? `${dash} 5` : `${dash} ${dash}`} strokeLinecap={thermal ? 'round' : undefined} mask={p < 1 ? `url(#${id})` : undefined} />
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
  if (useLook().look === 'thermal') {
    // a pill, as the specimen's sites: yellow with a blue rim when in play, a dotted outline when left out
    return (
      <g>
        <rect x={x - 6} y={y - 10} width={12} height={20} rx={6} fill="none" stroke={GREY} strokeWidth={1.2} strokeDasharray="2 3" opacity={1 - on} />
        <rect x={x - 6} y={y - 10} width={12} height={20} rx={6} fill={HOT} stroke={BLUE} strokeWidth={1.6} opacity={on} />
        {label && (
          <text x={lx + (side === 'right' ? 2 : side === 'left' ? -2 : 0)} y={ly} style={MONO} fontSize={13} letterSpacing={1.4} textAnchor={anchor} fill={INK} opacity={0.4 + 0.6 * on}>
            {label.toUpperCase()}
          </text>
        )}
      </g>
    )
  }
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
export const Handle = ({ at, r = 7 }: { at: Pt; r?: number }) =>
  useLook().look === 'thermal' ? (
    <g>
      <circle cx={at[0]} cy={at[1]} r={r + 5} fill="none" stroke={INK} strokeWidth={1} strokeDasharray="2 3" />
      <circle cx={at[0]} cy={at[1]} r={r} fill={LIME} stroke={INK} strokeWidth={1.5} />
    </g>
  ) : (
    <circle cx={at[0]} cy={at[1]} r={r} fill={PAPER} stroke={INK} strokeWidth={2} />
  )

/** A black tag of small capitals, like the page's own tags */
export function Tag({ at, text, opacity = 1, anchor = 'start' }: { at: Pt; text: string; opacity?: number; anchor?: 'start' | 'middle' | 'end' }) {
  const thermal = useLook().look === 'thermal'
  const w = text.length * (thermal ? 9.4 : 9.6) + 20
  const x = anchor === 'start' ? at[0] : anchor === 'middle' ? at[0] - w / 2 : at[0] - w
  if (opacity <= 0) return null
  if (thermal)
    return (
      <g opacity={opacity}>
        <rect x={x} y={at[1] - 17} width={w} height={25} fill={LIME} />
        <text x={x + 10} y={at[1] + 1} style={MONO} fontSize={13} letterSpacing={1.2} fill={INK}>
          {text.toUpperCase()}
        </text>
      </g>
    )
  return (
    <g opacity={opacity}>
      <rect x={x} y={at[1] - 17} width={w} height={25} rx={3} fill={INK} />
      <text x={x + 10} y={at[1] + 1} fontSize={14} fontWeight={600} letterSpacing={0.7} fill={PAPER}>
        {text.toUpperCase()}
      </text>
    </g>
  )
}

/**
 * The point a film makes, hung off the place it happens, as asimorb.com hangs its menu: a node on the thing, a dotted
 * line that draws out from it, and a soft panel with a label over a hairline and a sentence or two. `p` brings it in.
 */
export function Note({
  from,
  at,
  label,
  lines,
  color,
  p = 1,
  width = 280,
}: {
  /** the node on the thing it's about */
  from: Pt
  /** the panel's top left */
  at: Pt
  label: string
  lines: string[]
  color: string
  p?: number
  width?: number
}) {
  const id = useId()
  const thermal = useLook().look === 'thermal'
  if (p <= 0) return null
  const h = 56 + lines.length * 24
  // the line meets the panel at the nearer of its top or bottom edge
  const end: Pt = [Math.min(at[0] + width - 24, Math.max(at[0] + 24, from[0])), from[1] < at[1] ? at[1] : at[1] + h]
  const show = ramp(p, 0.45, 1)
  if (thermal)
    return (
      <g>
        <Dotted d={`M${from[0]},${from[1]} L${end[0]},${end[1]}`} p={ramp(p, 0, 0.5)} color={INK} opacity={0.55} dash={4} />
        <rect x={from[0] - 5} y={from[1] - 8} width={10} height={16} rx={5} fill={HOT} stroke={BLUE} strokeWidth={1.4} />
        <g opacity={show}>
          {/* the specimen's hull: a pale wash of the case's colour inside a thin line of it */}
          <rect x={at[0]} y={at[1]} width={width} height={h} fill={color} fillOpacity={0.13} stroke={color} strokeOpacity={0.7} strokeWidth={1.2} />
          <rect x={at[0] + 12} y={at[1] + 12} width={label.length * 8.6 + 16} height={22} fill={LIME} />
          <text x={at[0] + 20} y={at[1] + 27} style={MONO} fontSize={12} letterSpacing={1.2} fill={INK}>
            {label.toUpperCase()}
          </text>
          {lines.map((l, i) => (
            <text key={i} x={at[0] + 18} y={at[1] + 66 + i * 24} fontSize={16} style={{ fontFamily: 'var(--font-sans)' }} fill={INK}>
              {l}
            </text>
          ))}
        </g>
      </g>
    )
  return (
    <g>
      <Dotted d={`M${from[0]},${from[1]} L${end[0]},${end[1]}`} p={ramp(p, 0, 0.5)} color={INK} opacity={0.55} dash={4} />
      <circle cx={from[0]} cy={from[1]} r={5} fill={PAPER} stroke={INK} strokeWidth={1.5} />
      <g opacity={show}>
        <clipPath id={id}>
          <rect x={at[0]} y={at[1]} width={width} height={h} rx={14} />
        </clipPath>
        {/* frosted: the case's colour glowing through a pale pane */}
        <g clipPath={`url(#${id})`}>
          <rect x={at[0]} y={at[1]} width={width} height={h} fill={PAPER} />
          <Orb at={[at[0] + width * 0.3, at[1] + h * 0.2]} r={width * 0.75} color={color} strength={0.75} />
          <rect x={at[0]} y={at[1]} width={width} height={h} fill="#fff" opacity={0.35} />
        </g>
        <rect x={at[0]} y={at[1]} width={width} height={h} rx={14} fill="none" stroke="#fff" strokeOpacity={0.7} />
        <text x={at[0] + 18} y={at[1] + 28} fontSize={13} fontWeight={600} letterSpacing={0.8} fill={INK}>
          {label.toUpperCase()}
        </text>
        <line x1={at[0] + 18} x2={at[0] + width - 18} y1={at[1] + 40} y2={at[1] + 40} stroke={INK} strokeOpacity={0.25} />
        {lines.map((l, i) => (
          <text key={i} x={at[0] + 18} y={at[1] + 66 + i * 24} fontSize={18} fill={INK}>
            {l}
          </text>
        ))}
      </g>
    </g>
  )
}

/** Maps an orb's white intensity onto the thermal ramp: alpha in, colour out */
function HeatFilter({ id, lead }: { id: string; lead: string }) {
  const { r, g, b, a } = heatRamp(lead)
  return (
    <defs>
      <filter id={id} x="-20%" y="-20%" width="140%" height="140%" colorInterpolationFilters="sRGB">
        <feGaussianBlur stdDeviation={3} />
        <feColorMatrix type="matrix" values="0 0 0 1 0  0 0 0 1 0  0 0 0 1 0  0 0 0 1 0" />
        <feComponentTransfer>
          <feFuncR type="table" tableValues={r.join(' ')} />
          <feFuncG type="table" tableValues={g.join(' ')} />
          <feFuncB type="table" tableValues={b.join(' ')} />
          <feFuncA type="table" tableValues={a.join(' ')} />
        </feComponentTransfer>
      </filter>
    </defs>
  )
}

/** The specimen's labels around the frame: its number and name on lime, the project, a running counter, the year */
function Specimen({ t, n, name }: { t: number; n: number; name: string }) {
  const tag = (x: number, y: number, lines: string[]) => (
    <g>
      <rect x={x} y={y} width={Math.max(...lines.map(l => l.length)) * 7.4 + 16} height={lines.length * 15 + 9} fill={LIME} />
      {lines.map((l, i) => (
        <text key={i} x={x + 8} y={y + 17 + i * 15} style={MONO} fontSize={11} letterSpacing={1.2} fill={INK}>
          {l}
        </text>
      ))}
    </g>
  )
  const count = String(Math.floor(t * 24) % 1000).padStart(3, '0')
  return (
    <g pointerEvents="none">
      {tag(16, 14, [`SPECIMEN ${String(n).padStart(2, '0')}`, name.toUpperCase()])}
      <text x={W - 16} y={30} style={MONO} fontSize={11} letterSpacing={1.2} textAnchor="end" fill={INK}>
        PROJ :: COINME
      </text>
      <text x={16} y={H - 14} fontSize={11} letterSpacing={1.2} fill={INK} style={{ ...MONO, fontVariantNumeric: 'tabular-nums' }}>
        {count}/1000
      </text>
      <text x={W / 2} y={H - 14} style={MONO} fontSize={11} letterSpacing={1.2} textAnchor="middle" fill={INK}>
        2026
      </text>
      <text x={W - 16} y={H - 14} style={MONO} fontSize={11} letterSpacing={1.2} textAnchor="end" fill={INK}>
        Ø
      </text>
    </g>
  )
}
