import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'

/**
 * The white-label model, live: a partner sends only the tokens it changes, the rest resolve
 * from the default theme for the chosen mode ("host theme wins"). The chart is a small cousin of
 * the price-history chart: scrub it, switch ranges and the line morphs.
 */

type Mode = 'light' | 'dark'
type PartnerTheme = { colors?: { primary?: string }; radius?: number }

const DEFAULTS = {
  light: { surface: '#ffffff', raised: '#f4f3ef', text: '#151514', muted: '#77746d', line: '#e7e4dc', primary: '#1f6f5c', onPrimary: '#ffffff', up: '#1f7a4d' },
  dark: { surface: '#151514', raised: '#1f1f1d', text: '#f2f0ea', muted: '#9a968d', line: '#2e2d2a', primary: '#5cbfa5', onPrimary: '#0f0f0e', up: '#5cc993' },
}
const DEFAULT_RADIUS = 10
/** roughly how many tokens a theme holds per mode */
const TOKENS_PER_THEME = 225

const PARTNERS: { name: string; theme: PartnerTheme }[] = [
  { name: 'Default', theme: {} },
  { name: 'Harbor', theme: { colors: { primary: '#2f4bd8' }, radius: 16 } },
  { name: 'Ember', theme: { colors: { primary: '#e0531f' }, radius: 2 } },
  { name: 'Orchid', theme: { colors: { primary: '#a3247c' }, radius: 999 } },
]

const RANGES = ['1D', '1W', '1M', '1Y'] as const
type Range = (typeof RANGES)[number]
const POINTS = 48

/** A deterministic price walk per range, so the demo looks the same on every visit */
function series(range: Range): number[] {
  const seed = { '1D': 1.3, '1W': 2.9, '1M': 4.1, '1Y': 6.7 }[range]
  const drift = { '1D': 0.6, '1W': -1.4, '1M': 3.2, '1Y': 9 }[range]
  return Array.from({ length: POINTS }, (_, i) => {
    const t = i / (POINTS - 1)
    return 68000 + drift * 900 * t + 1400 * Math.sin(t * 7 + seed) + 650 * Math.sin(t * 19 + seed * 2) + 260 * Math.sin(t * 41 + seed * 3)
  })
}

const W = 268
const H = 112

/** Catmull-Rom through the points, written as cubic beziers */
function smoothPath(pts: [number, number][]) {
  let d = `M${pts[0][0]},${pts[0][1]}`
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i - 1] ?? pts[i]
    const [x1, y1] = pts[i]
    const [x2, y2] = pts[i + 1]
    const [x3, y3] = pts[i + 2] ?? pts[i + 1]
    d += ` C${x1 + (x2 - x0) / 6},${y1 + (y2 - y0) / 6} ${x2 - (x3 - x1) / 6},${y2 - (y3 - y1) / 6} ${x2},${y2}`
  }
  return d
}

const usd = (n: number) => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

function Chart({ range, onScrub }: { range: Range; onScrub: (i: number | null, values: number[]) => void }) {
  const [values, setValues] = useState(() => series(range))
  const [hover, setHover] = useState<number | null>(null)
  const from = useRef(values)

  // morph between ranges: every point eases from where it is to its new value
  useEffect(() => {
    const start = from.current
    const target = series(range)
    const t0 = performance.now()
    let raf = 0
    const step = (now: number) => {
      const k = Math.min(1, (now - t0) / 600)
      const e = 1 - Math.pow(1 - k, 4)
      const next = target.map((v, i) => start[i] + (v - start[i]) * e)
      from.current = next
      setValues(next)
      if (k < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [range])

  const min = Math.min(...values)
  const max = Math.max(...values)
  const pts = values.map((v, i) => [(i / (POINTS - 1)) * W, 8 + (1 - (v - min) / (max - min || 1)) * (H - 16)] as [number, number])
  const line = smoothPath(pts)

  const scrub = (e: React.PointerEvent<SVGSVGElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    const i = Math.round(Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)) * (POINTS - 1))
    setHover(i)
    onScrub(i, values)
  }

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="block w-full touch-none select-none"
      onPointerMove={scrub}
      onPointerDown={scrub}
      onPointerLeave={() => {
        setHover(null)
        onScrub(null, values)
      }}
      role="img"
      aria-label={`Price over ${range}, scrub to read a value`}
    >
      <defs>
        <linearGradient id="ds-fill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="var(--p)" stopOpacity="0.22" />
          <stop offset="1" stopColor="var(--p)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${line} L${W},${H} L0,${H} Z`} fill="url(#ds-fill)" />
      <path d={line} fill="none" stroke="var(--p)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      {hover !== null && (
        <>
          <line x1={pts[hover][0]} x2={pts[hover][0]} y1="0" y2={H} stroke="var(--m)" strokeDasharray="2 3" />
          <circle cx={pts[hover][0]} cy={pts[hover][1]} r="4.5" fill="var(--s)" stroke="var(--p)" strokeWidth="2" />
        </>
      )}
    </svg>
  )
}

export default function DesignSystemDemo() {
  const [partner, setPartner] = useState(1)
  const [mode, setMode] = useState<Mode>('light')
  const [range, setRange] = useState<Range>('1W')
  const [amount, setAmount] = useState(100)
  const [scrub, setScrub] = useState<{ price: number; change: number } | null>(null)

  const { name, theme } = PARTNERS[partner]
  // host theme wins: a deep merge of the partner's partial theme over the defaults for this mode
  const t = { ...DEFAULTS[mode], ...theme.colors, ...(theme.colors?.primary ? { onPrimary: '#ffffff' } : {}) }
  const radius = theme.radius ?? DEFAULT_RADIUS
  const sent = (theme.colors ? Object.keys(theme.colors).length : 0) + (theme.radius !== undefined ? 1 : 0)
  const payload = JSON.stringify({ mode, ...theme }, null, 2)

  const last = useMemo(() => {
    const v = series(range)
    return { price: v[v.length - 1], change: ((v[v.length - 1] - v[0]) / v[0]) * 100 }
  }, [range])
  const shown = scrub ?? last

  const vars = {
    '--s': t.surface,
    '--r': t.raised,
    '--t': t.text,
    '--m': t.muted,
    '--l': t.line,
    '--p': t.primary,
    '--op': t.onPrimary,
    '--up': t.up,
    '--rad': `${radius}px`,
    '--rad-card': `${Math.min(radius, 18)}px`,
  } as CSSProperties

  return (
    <div className="ds grid gap-x-[var(--gap)] gap-y-8 md:grid-cols-9">
      {/* the phone: everything inside reads tokens, nothing is hard-coded */}
      <div className="md:col-span-4">
        <div className="ds-phone mx-auto w-full max-w-[320px]" style={vars}>
          <div className="ds-screen">
            <div className="flex items-center justify-between px-5 pt-3 text-[11px] font-semibold tabular-nums">
              <span>9:41</span>
              <span className="flex items-center gap-1.5">
                <span className="ds-mark" />
                {name === 'Default' ? 'Your app' : `${name} Wallet`}
              </span>
            </div>

            <div className="mx-5 mt-4 flex gap-5 border-b border-[var(--l)] text-[13px]">
              <span className="ds-tab-on pb-2 font-semibold">Buy</span>
              <span className="pb-2 text-[var(--m)]">Sell</span>
              <span className="pb-2 text-[var(--m)]">Send</span>
            </div>

            <div className="mx-5 mt-4 flex items-center gap-3">
              <span className="ds-coin">₿</span>
              <div className="min-w-0">
                <p className="text-[13px] font-semibold">Bitcoin</p>
                <p className="text-[11px] text-[var(--m)]">BTC</p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-[13px] font-semibold tabular-nums">{usd(shown.price)}</p>
                <p className="text-[11px] tabular-nums" style={{ color: shown.change >= 0 ? 'var(--up)' : 'var(--m)' }}>
                  {shown.change >= 0 ? '+' : ''}
                  {shown.change.toFixed(2)}%
                </p>
              </div>
            </div>

            <div className="mx-3 mt-3">
              <Chart
                range={range}
                onScrub={(i, v) => setScrub(i === null ? null : { price: v[i], change: ((v[i] - v[0]) / v[0]) * 100 })}
              />
            </div>
            <div className="mx-5 mt-1 flex justify-between text-[11px]">
              {RANGES.map(r => (
                <button key={r} className={`ds-pill ${range === r ? 'ds-pill-on' : ''}`} onClick={() => setRange(r)}>
                  {r}
                </button>
              ))}
            </div>

            <div className="mx-5 mt-5 grid grid-cols-3 gap-2 text-[13px] tabular-nums">
              {[50, 100, 250].map(a => (
                <button key={a} className={`ds-chip ${amount === a ? 'ds-chip-on' : ''}`} onClick={() => setAmount(a)}>
                  ${a}
                </button>
              ))}
            </div>
            <div className="mx-5 mt-3 flex justify-between border-y border-[var(--l)] py-2.5 text-[12px]">
              <span className="text-[var(--m)]">Pay with</span>
              <span>Cash at a store ›</span>
            </div>
            <div className="mx-5 mt-4 pb-6">
              <span className="ds-button">Buy {usd(amount).replace('.00', '')} of BTC</span>
            </div>
          </div>
        </div>
        <p className="label mt-3 text-center">Scrub the chart, switch the range</p>
      </div>

      {/* the controls: what a partner actually changes */}
      <div className="md:col-span-5">
        <p className="label">Partner</p>
        <div className="mt-1" role="radiogroup" aria-label="Partner theme">
          {PARTNERS.map((p, i) => (
            <button
              key={p.name}
              role="radio"
              aria-checked={partner === i}
              onClick={() => setPartner(i)}
              className={`flex w-full items-center gap-3 py-2 text-left rule-top ${partner === i ? '' : 'text-muted'}`}
            >
              <span
                className="size-3.5 shrink-0"
                style={{
                  background: p.theme.colors?.primary ?? DEFAULTS[mode].primary,
                  borderRadius: Math.min(p.theme.radius ?? DEFAULT_RADIUS, 7),
                }}
              />
              <span className="flex-1">{p.name}</span>
              <span className="tabular-nums">{partner === i ? '●' : ''}</span>
            </button>
          ))}
        </div>

        <div className="mt-5 flex items-center gap-4 rule-top pt-2">
          <span className="label flex-1">Mode</span>
          {(['light', 'dark'] as const).map(m => (
            <button key={m} className={`link capitalize ${mode === m ? '' : 'text-muted'}`} aria-pressed={mode === m} onClick={() => setMode(m)}>
              {m}
            </button>
          ))}
        </div>

        <p className="label mt-6">What the partner sends</p>
        <pre className="code mt-1">{payload}</pre>
        <p className="mt-3">
          {sent ? `${sent} token${sent > 1 ? 's' : ''} sent.` : 'Nothing sent.'}{' '}
          <span className="text-muted">
            The other ~{TOKENS_PER_THEME - sent} resolve from the default {mode} theme, in the same render. No fork, no rebuild.
          </span>
        </p>
      </div>
    </div>
  )
}
