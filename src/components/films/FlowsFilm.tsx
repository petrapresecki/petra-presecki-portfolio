import { Cap, Film, INK, MUTED, PAPER, RULE, easeInOut, lerp, ramp } from '@/components/films/Film'

/**
 * One library of flows, a different app for every partner: the partner's config picks its flows, they leave
 * the library and stack up in its app. No new code, only a new config.
 */

const FLOWS: [string, string][] = [
  ['IDENTITY', 'Verify identity'],
  ['CASH BUY', 'Buy with cash'],
  ['ATM CASH-OUT', 'Cash out at an ATM'],
  ['CARD BUY', 'Buy with a card'],
  ['WALLET', 'Wallet'],
  ['LOCATIONS', 'Find a store'],
  ['HISTORY', 'History'],
]

const PARTNERS = [
  { name: 'Harbor', kind: 'A SELF-CUSTODY WALLET', primary: '#2f4bd8', landing: 'BUY', flows: [0, 1, 5] },
  { name: 'Ember', kind: 'A CASH-FIRST APP', primary: '#e0531f', landing: 'CASH BUY', flows: [0, 1, 2, 5, 6] },
  { name: 'Orchid', kind: 'A FULL CRYPTO APP', primary: '#a3247c', landing: 'WALLET', flows: [0, 1, 2, 3, 4, 5, 6] },
]
const EACH = 4.4

// the library along the bottom, and the app's rows
const TAG = { y: 492, w: 112, h: 32, gap: 12, x: 60 }
const SLOT = { x: 626, y: 120, w: 248, h: 34, step: 40 }

export default function FlowsFilm({ play }: { play: boolean | 'view' }) {
  return (
    <Film length={PARTNERS.length * EACH} still={EACH * 2 + 3} play={play} label="Each partner's config picks its flows from one library">
      {t => {
        const p = PARTNERS[Math.floor(t / EACH)]
        const u = t % EACH
        const out = 1 - ramp(u, EACH - 0.45, EACH - 0.05)
        return (
          <>
            {/* the config */}
            <g opacity={out}>
              <Cap x={60} y={70} fill={MUTED}>
                / PARTNER CONFIG
              </Cap>
              <text x={60} y={130} fontSize={48} fontWeight={500} letterSpacing={-0.8} fill={INK} opacity={ramp(u, 0, 0.35)}>
                {p.name}
              </text>
              <Cap x={60} y={160} fill={MUTED}>
                {p.kind}
              </Cap>
              {(
                [
                  ['THEME', null],
                  ['LANDING', p.landing],
                  ['FLOWS', `${p.flows.length} OF ${FLOWS.length}`],
                  ['NEW CODE', 'NONE'],
                ] as const
              ).map(([k, v], i) => {
                const y = 222 + i * 42
                return (
                  <g key={k}>
                    <line x1={60} x2={420} y1={y - 24} y2={y - 24} stroke={RULE} />
                    <Cap x={60} y={y} fill={MUTED}>
                      {k}
                    </Cap>
                    {v ? (
                      <Cap x={420} y={y} textAnchor="end">
                        {v}
                      </Cap>
                    ) : (
                      <rect x={404} y={y - 12} width={16} height={16} fill={p.primary} />
                    )}
                  </g>
                )
              })}
              <line x1={60} x2={420} y1={366} y2={366} stroke={RULE} />
            </g>

            {/* the orchestrator reads it and builds the app */}
            <Cap x={512} y={226} textAnchor="middle" fill={MUTED}>
              ORCHESTRATOR
            </Cap>
            <line x1={448} x2={572} y1={242} y2={242} stroke={INK} strokeDasharray="4 5" strokeDashoffset={-t * 18} />
            <path d="M566 236 L574 242 L566 248" fill="none" stroke={INK} />

            <rect x={600} y={24} width={300} height={418} rx={30} fill="none" stroke={INK} strokeWidth={1.5} />
            <g opacity={out}>
              <rect x={626} y={56} width={12} height={12} fill={p.primary} />
              <text x={646} y={67} fontSize={14} fontWeight={600} fill={INK}>
                {p.name}
              </text>
              <text x={626} y={102} fontSize={22} fontWeight={600} letterSpacing={-0.3} fill={INK}>
                Get crypto
              </text>
            </g>

            {/* the library */}
            <Cap x={60} y={474} fill={MUTED}>
              / FLOW LIBRARY · SAME IN EVERY APP
            </Cap>
            {FLOWS.map(([tag], i) => {
              const k = p.flows.indexOf(i)
              const on = k < 0 ? 0 : ramp(u, 0.3 + k * 0.1, 0.5 + k * 0.1) * out
              const x = TAG.x + i * (TAG.w + TAG.gap)
              return (
                <g key={tag}>
                  <rect x={x} y={TAG.y} width={TAG.w} height={TAG.h} fill="none" stroke={RULE} />
                  <rect x={x} y={TAG.y} width={TAG.w} height={TAG.h} fill={INK} opacity={on} />
                  <Cap x={x + TAG.w / 2} y={TAG.y + 21} size={11.5} textAnchor="middle" fill={on > 0.5 ? PAPER : INK}>
                    {tag}
                  </Cap>
                </g>
              )
            })}

            {/* each picked flow travels up into its row */}
            {p.flows.map((f, k) => {
              const s = 0.9 + k * 0.17
              const go = ramp(u, s, s + 0.7, easeInOut)
              if (go === 0) return null
              const land = ramp(u, s + 0.7, s + 1.05)
              const x = lerp(TAG.x + f * (TAG.w + TAG.gap), SLOT.x, go)
              const y = lerp(TAG.y, SLOT.y + k * SLOT.step, go)
              const w = lerp(TAG.w, SLOT.w, go)
              const h = lerp(TAG.h, SLOT.h, go)
              return (
                <g key={f} opacity={out}>
                  <rect x={x} y={y} width={w} height={h} fill={INK} opacity={1 - land} />
                  <Cap x={x + w / 2} y={y + h / 2 + 4} size={11.5} textAnchor="middle" fill={PAPER} opacity={1 - land}>
                    {FLOWS[f][0]}
                  </Cap>
                  <g opacity={land}>
                    <line x1={SLOT.x} x2={SLOT.x + SLOT.w} y1={y + h} y2={y + h} stroke={RULE} />
                    <rect x={SLOT.x} y={y + 11} width={11} height={11} fill={p.primary} />
                    <text x={SLOT.x + 22} y={y + 21} fontSize={14} fill={INK}>
                      {FLOWS[f][1]}
                    </text>
                    <text x={SLOT.x + SLOT.w} y={y + 21} fontSize={14} textAnchor="end" fill={MUTED}>
                      ›
                    </text>
                  </g>
                </g>
              )
            })}
          </>
        )
      }}
    </Film>
  )
}
