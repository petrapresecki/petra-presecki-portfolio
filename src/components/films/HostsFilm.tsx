import { useId } from 'react'
import { Film, INK, MUTED, PAPER, RULE, easeInOut, lerp, ramp } from '@/components/films/Film'

/**
 * The design system's film, set like the Vault film: one of its components, the price chart, on the page, and
 * the hosts it runs in inside the ink block.
 * The chart is scrubbed, then a copy of its line runs along the chart's rule into the block, turning paper as it
 * crosses, and draws itself into each host in turn, in that host's brand. No partner writes any of it.
 */

// the partners' brands, and how each looks in light or dark
const BRANDS = [
  { name: 'Default', primary: '#151514', surface: '#ffffff' },
  { name: 'Harbor', primary: '#2f4bd8', surface: '#ffffff' },
  { name: 'Ember', primary: '#e0531f', surface: '#fbf1e6' },
  { name: 'Orchid', primary: '#5cbfa5', surface: '#ffffff' },
]
const colours = (brand: (typeof BRANDS)[number], dark: boolean) =>
  dark
    ? { surface: '#151514', text: '#f2f0ea', primary: brand.name === 'Default' ? '#f2f0ea' : brand.primary }
    : { surface: brand.surface, text: '#151514', primary: brand.primary }

const EDGE = 560
const CHART = { x: 80, y: 196, w: 420, h: 92 }
const RULE_Y = 304
const LENGTH = 9
const SEND = 1.9
const ARRIVE = 2.6
const EACH_HOST = 0.2

// a day of prices: a rise with noise
const N = 28
const PRICES = Array.from({ length: N }, (_, i) => 0.18 + (i / (N - 1)) * 0.62 + (Math.sin(i * 2.7) * 0.5 + Math.sin(i * 1.3 + 1) * 0.5) * 0.12)
const line = (x: number, y: number, w: number, h: number) => PRICES.map((v, i) => `${x + (i * w) / (N - 1)},${y + h - v * h}`).join(' ')
/** the price a share x of the way along the day */
const at = (x: number) => {
  const f = Math.min(N - 1.001, Math.max(0, x * (N - 1)))
  const i = Math.floor(f)
  return lerp(PRICES[i], PRICES[i + 1], f - i)
}

type Chrome = 'phone' | 'browser' | 'webview'
const HOSTS: { name: string; chrome: Chrome; brand: number; dark: boolean }[] = [
  { name: 'iOS app', chrome: 'phone', brand: 1, dark: false },
  { name: 'Android app', chrome: 'phone', brand: 2, dark: false },
  { name: 'Web iframe', chrome: 'browser', brand: 0, dark: false },
  { name: 'iOS WebView', chrome: 'webview', brand: 3, dark: true },
  { name: 'Android WebView', chrome: 'webview', brand: 1, dark: true },
  { name: 'React Native SDK', chrome: 'phone', brand: 2, dark: false },
]
const FRAME = { w: 104, h: 96 }
const fx = (i: number) => EDGE + 30 + (i % 3) * (FRAME.w + 14)
const fy = (i: number) => 340 + Math.floor(i / 3) * (FRAME.h + 34)
const lands = (i: number) => ARRIVE + i * EACH_HOST

function Host({ i, drawn, flash }: { i: number; drawn: number; flash: boolean }) {
  const h = HOSTS[i]
  const x = fx(i)
  const y = fy(i)
  const c = colours(BRANDS[h.brand], h.dark)
  const top = h.chrome === 'phone' ? 12 : 16
  const inner = { x: x + 6, y: y + top, w: FRAME.w - 12, h: FRAME.h - top - 6 }
  return (
    <g>
      <rect x={x} y={y} width={FRAME.w} height={FRAME.h} rx={h.chrome === 'browser' ? 3 : 10} fill={INK} stroke={PAPER} strokeOpacity={flash ? 1 : 0.45} strokeWidth={flash ? 2 : 1} />
      {h.chrome === 'phone' && <rect x={x + FRAME.w / 2 - 10} y={y + 4} width={20} height={4} rx={2} fill={PAPER} opacity={0.35} />}
      {h.chrome === 'browser' && [0, 1, 2].map(k => <circle key={k} cx={x + 8 + k * 7} cy={y + 8} r={2} fill={PAPER} opacity={0.45} />)}
      {/* a WebView sits under the partner's own bar */}
      {h.chrome === 'webview' && <rect x={x + 6} y={y + 5} width={FRAME.w - 12} height={8} fill={BRANDS[h.brand].primary} />}
      <rect x={inner.x} y={inner.y} width={inner.w} height={inner.h} fill={c.surface} />
      <rect x={inner.x + 6} y={inner.y + 7} width={30} height={6} fill={c.text} />
      {/* the chart draws itself in once it arrives */}
      {drawn > 0 && (
        <polyline points={line(inner.x + 6, inner.y + 20, inner.w - 12, inner.h - 28)} fill="none" stroke={c.primary} strokeWidth={1.5} strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - drawn} />
      )}
      <text x={x} y={y + FRAME.h + 16} fontSize={12} fill={PAPER} opacity={0.6}>
        {h.name}
      </text>
    </g>
  )
}

export default function HostsFilm({ play }: { play: boolean | 'view' }) {
  const id = useId()
  return (
    <Film length={LENGTH} still={6} play={play} label="One price chart, written once, rendered in six hosts">
      {t => {
        const out = 1 - ramp(t, LENGTH - 0.4, LENGTH - 0.05)
        const done = HOSTS.filter((_, i) => t >= lands(i)).length
        // the finger on the chart: across it before it's sent, and again once every host has it
        const scrub = t < SEND ? ramp(t, 0.3, 1.7, easeInOut) : ramp(t, 5, 8.2, easeInOut)
        const scrubbing = (t > 0.3 && t < 1.75) || (t > 5 && t < 8.25)
        const sy = CHART.y + CHART.h - at(scrub) * CHART.h
        const sx = CHART.x + scrub * CHART.w
        // the price rides above the finger, kept inside the chart
        const lx = Math.min(CHART.x + CHART.w - 44, Math.max(CHART.x + 44, sx))
        const travel = ramp(t, SEND, ARRIVE - 0.05, x => x * x)
        // drawn twice, in ink on the page and in paper over the block, so the line changes colour as it crosses
        const both = (node: (fill: string) => React.ReactNode) => (
          <>
            <g clipPath={`url(#${id}-page)`}>{node(INK)}</g>
            <g clipPath={`url(#${id}-block)`}>{node(PAPER)}</g>
          </>
        )
        return (
          <g opacity={out}>
            <clipPath id={`${id}-page`}>
              <rect width={EDGE} height={600} />
            </clipPath>
            <clipPath id={`${id}-block`}>
              <rect x={EDGE} width={960 - EDGE} height={600} />
            </clipPath>

            {/* the hosts */}
            <rect x={EDGE} width={960 - EDGE} height={600} fill={INK} />
            <text x={EDGE + 40} y={116} fontSize={64} fontWeight={500} letterSpacing={-1.6} fill={PAPER}>
              6 hosts
            </text>
            <text x={EDGE + 40} y={152} fontSize={17} fill={PAPER} opacity={0.6}>
              iOS, Android, web, WebViews, an SDK
            </text>
            {HOSTS.map((_, i) => (
              <Host key={i} i={i} drawn={ramp(t, lands(i), lands(i) + 0.5, easeInOut)} flash={t >= lands(i) && t < lands(i) + 0.45} />
            ))}

            {/* the component */}
            <text x={80} y={116} fontSize={64} fontWeight={500} letterSpacing={-1.6} fill={INK}>
              Price chart
            </text>
            <text x={80} y={CHART.y - 44} fontSize={16} fill={MUTED}>
              One component, written once
            </text>
            <polyline points={line(CHART.x, CHART.y, CHART.w, CHART.h)} fill="none" stroke={INK} strokeWidth={2.5} strokeLinejoin="round" />
            {scrubbing && (
              <g>
                <line x1={sx} x2={sx} y1={CHART.y - 8} y2={RULE_Y} stroke={INK} />
                <circle cx={sx} cy={sy} r={5} fill={PAPER} stroke={INK} strokeWidth={2} />
                <rect x={lx - 44} y={CHART.y - 22} width={88} height={20} fill={PAPER} />
                <text x={lx} y={CHART.y - 7} fontSize={15} fontWeight={500} textAnchor="middle" fill={INK} className="tabular-nums">
                  ${(60200 + at(scrub) * 5200).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                </text>
              </g>
            )}

            {/* the chart's rule doesn't stop at the page: it runs on into the hosts */}
            {both(f => <line x1={80} x2={920} y1={RULE_Y} y2={RULE_Y} stroke={f} strokeWidth={1.5} strokeOpacity={f === INK ? 1 : 0.5} />)}
            {/* a copy of the line, running along it and in */}
            {t >= SEND && t < ARRIVE &&
              both(f => (
                <polyline points={line(lerp(CHART.x, 780, travel), RULE_Y - 34, 120, 28)} fill="none" stroke={f} strokeWidth={2} strokeLinejoin="round" opacity={1 - ramp(travel, 0.8, 1)} />
              ))}

            <text x={80} y={380} fontSize={20} fontWeight={500} fill={INK}>
              What it takes
            </text>
            {(
              [
                ['Hosts rendering it', `${done} of ${HOSTS.length}`],
                ['Code partners write', 'None'],
              ] as const
            ).map(([k, v], i) => (
              <g key={k}>
                <line x1={80} x2={500} y1={398 + i * 52} y2={398 + i * 52} stroke={RULE} />
                <text x={80} y={430 + i * 52} fontSize={17} fill={MUTED}>
                  {k}
                </text>
                <text x={500} y={430 + i * 52} fontSize={17} textAnchor="end" fill={INK} className="tabular-nums">
                  {v}
                </text>
              </g>
            ))}
            <line x1={80} x2={500} y1={502} y2={502} stroke={RULE} />
          </g>
        )
      }}
    </Film>
  )
}
