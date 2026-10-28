import { CORAL, Dotted, Film, GREY, INK, LEAD, MUTED, Node, Note, Orb, PEACH, PINK, RULE, along, curve, drift, lerp, mix, ramp } from '@/components/films/Film'

/**
 * Partners rebrand by config. On the left, a partner's theme: it sends only the tokens it changes (a colour, a corner
 * radius) and leaves the rest to the default, because the host's theme wins a deep merge. The theme crosses as the
 * partner's light, and the same price chart and button in an iOS app, an Android app and on the web all take it on
 * the same frame. Three partners in turn, then back to the default; no partner writes a line of code.
 */

const NEUTRAL = '#9a958c'
const PARTNERS = [
  { name: 'Default', color: NEUTRAL, radius: 6, glow: GREY },
  { name: 'Harbor', color: CORAL, radius: 13, glow: CORAL },
  { name: 'Ember', color: '#e8753f', radius: 2, glow: PEACH },
  { name: 'Orchid', color: '#e2659f', radius: 8, glow: PINK },
]
const FIRST = 1.0
const EACH = 4.2
const LENGTH = FIRST + (PARTNERS.length - 1) * EACH + 1.6
const ARRIVE = 1.7

// a day of prices: a rise with noise
const N = 22
const PRICES = Array.from({ length: N }, (_, i) => 0.2 + (i / (N - 1)) * 0.6 + (Math.sin(i * 2.7) * 0.5 + Math.sin(i * 1.3 + 1) * 0.5) * 0.12)
const chart = (x: number, y: number, w: number, h: number) => PRICES.map((v, i) => `${x + (i * w) / (N - 1)},${y + h - v * h}`).join(' ')

const HOSTS = [
  { name: 'iOS', x: 470, y: 150, w: 128, h: 250, phone: true },
  { name: 'Android', x: 620, y: 150, w: 128, h: 250, phone: true },
  { name: 'Web', x: 770, y: 175, w: 160, h: 200, phone: false },
]
const SEND = [[330, 330], [420, 470], [700, 290]] as const

/** which partner's turn it is, where in it we are, and the one before */
function phase(t: number) {
  if (t < FIRST) return { i: 0, u: t + EACH, prev: 0 }
  const k = Math.min(PARTNERS.length - 1, 1 + Math.floor((t - FIRST) / EACH))
  return { i: k, u: t - FIRST - (k - 1) * EACH, prev: k - 1 }
}

export default function HostsFilm({ play }: { play: boolean | 'view' }) {
  return (
    <Film length={LENGTH} still={FIRST + EACH + 3} play={play} label="Each partner sends a few tokens; the same component takes them on iOS, Android and the web at once">
      {t => {
        let { i, u, prev } = phase(t)
        // the loop's last stretch hands back to the default, so the next round starts where this one did
        const home = ramp(t, LENGTH - 1.2, LENGTH - 0.2)
        if (home > 0) [i, prev, u] = [0, PARTNERS.length - 1, ARRIVE + home * 0.6]
        const [p, q] = [PARTNERS[i], PARTNERS[prev]]
        const named = home > 0 ? home : ramp(u, 0, 0.5)
        const sent = home > 0 ? 1 : ramp(u, 0.2, 1.0)
        const travel = ramp(u, 0.5, ARRIVE)
        const took = home > 0 ? home : ramp(u, ARRIVE - 0.1, ARRIVE + 0.5)
        const color = mix(q.color, p.color, took)
        const radius = lerp(q.radius, p.radius, took)
        const [dx, dy] = drift(t, LENGTH, 3, 12)
        const [gx, gy] = drift(t, LENGTH, 4, 16)
        return (
          <g>
            {/* the theme the hosts are wearing, as light behind them */}
            <Orb at={[700 + gx, 300 + gy]} r={260} color={q.glow} strength={0.55 * (1 - took)} />
            <Orb at={[700 + gx, 300 + gy]} r={260} color={p.glow} strength={0.55 * took} />

            {/* the partner's theme: the tokens it sends, and the ones it leaves to the default */}
            <text x={80} y={130} fontSize={56} fontWeight={500} letterSpacing={-1.4} fill={INK} opacity={1 - named}>
              {q.name}
            </text>
            <text x={80} y={130} fontSize={56} fontWeight={500} letterSpacing={-1.4} fill={INK} opacity={named}>
              {p.name}
            </text>
            <text x={80} y={164} fontSize={16} fill={MUTED}>
              {i ? 'Sends only what it changes' : 'The library’s own theme'}
            </text>
            {(
              [
                ['Primary', true],
                ['Corner radius', true],
                ['Spacing', false],
                ['Typeface', false],
              ] as const
            ).map(([k, own], r) => {
              const y = 262 + r * 44
              return (
                <g key={k}>
                  <Dotted d={`M80,${y + 14} H330`} color={RULE} dash={2} />
                  <text x={80} y={y} fontSize={17} fill={own && i ? INK : MUTED}>
                    {k}
                  </text>
                  {own ? (
                    k === 'Primary' ? (
                      <Node at={[322, y - 6]} color={mix(q.color, p.color, named)} on={1} />
                    ) : (
                      <text x={330} y={y} fontSize={17} textAnchor="end" fill={INK} className="tabular-nums">
                        {Math.round(radius)}
                      </text>
                    )
                  ) : (
                    <text x={330} y={y} fontSize={17} textAnchor="end" fill={MUTED}>
                      default
                    </text>
                  )}
                </g>
              )
            })}

            <Note
              from={[300, 408]}
              at={[80, 436]}
              width={330}
              color={LEAD.theme}
              label="The host’s theme wins"
              lines={['It sends 2 of 4 tokens; the', 'rest stay the library’s own']}
              p={(i === 1 ? ramp(u, 0.6, 1.6) : i > 1 ? 1 : 0) * (1 - home)}
            />

            {/* the tokens cross as the partner's light, once per partner */}
            {i > 0 && home === 0 && (
              <>
                <Dotted d={curve(SEND)} p={sent} color={p.glow} opacity={1 - ramp(u, ARRIVE + 0.4, ARRIVE + 1.2)} />
                {travel > 0 && travel < 1 && <Orb at={along(SEND, travel)} r={60} color={p.glow} strength={1 - ramp(travel, 0.75, 1)} />}
              </>
            )}

            {/* one price chart and one button, in three hosts, all taking the theme on the same frame */}
            {HOSTS.map((h, k) => {
              const ix = h.x + 12
              const iw = h.w - 24
              const top = h.y + (h.phone ? 34 : 30)
              return (
                <g key={h.name} transform={`translate(${dx * (k - 1) * 0.3},${dy * 0.3})`}>
                  <rect x={h.x} y={h.y} width={h.w} height={h.h} rx={h.phone ? 22 : 6} fill="none" stroke={INK} strokeWidth={1.5} />
                  {h.phone ? (
                    <line x1={h.x + h.w / 2 - 14} x2={h.x + h.w / 2 + 14} y1={h.y + 14} y2={h.y + 14} stroke={INK} strokeWidth={3} strokeLinecap="round" />
                  ) : (
                    [0, 1, 2].map(d => <circle key={d} cx={h.x + 14 + d * 10} cy={h.y + 14} r={2.5} fill={INK} />)
                  )}
                  <text x={ix} y={top + 12} fontSize={11} fontWeight={600} fill={INK}>
                    BTC
                  </text>
                  <polyline points={chart(ix, top + 24, iw, h.h * 0.32)} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" />
                  <rect x={ix} y={h.y + h.h - 44} width={iw} height={26} rx={radius} fill={color} />
                  <text x={h.x + h.w / 2} y={h.y + h.h - 27} fontSize={11} fontWeight={600} textAnchor="middle" fill="#fff">
                    Buy
                  </text>
                  <text x={h.x + h.w / 2} y={h.y + h.h + 30} fontSize={16} fontWeight={600} letterSpacing={0.6} textAnchor="middle" fill={INK}>
                    {h.name.toUpperCase()}
                  </text>
                </g>
              )
            })}
            <text x={470} y={512} fontSize={16} fill={MUTED}>
              Code the partner writes
            </text>
            <text x={930} y={512} fontSize={16} textAnchor="end" fill={INK}>
              None
            </text>
            <Dotted d="M470,528 H930" color={RULE} dash={2} />
          </g>
        )
      }}
    </Film>
  )
}
