import { useId } from 'react'
import { Film, INK, MUTED, PAPER, RULE, easeInOut, lerp, ramp } from '@/components/films/Film'

/**
 * The flows film, set like the Vault film: a customer in a partner's app asks for something, and its line runs
 * on into the orchestrator. On the page, the orchestrator's checks fill in one by one; in the ink block, the
 * partner's config has already greyed out the flows it doesn't offer. Then the orchestrator mounts the flow, holds
 * the customer in due diligence first, or, when the region isn't confirmed, mounts nothing.
 */

const FLOWS = ['Sign-up', 'Identity', 'Due diligence', 'Cash buy', 'Card buy', 'Sell at an ATM', 'Wallet']

type Visit = {
  partner: string
  asks: string
  offers: string[]
  checks: [string, string, boolean][]
  /** the flow it mounts, or none when it fails closed */
  mounts: string | null
  says: string
}
const VISITS: Visit[] = [
  {
    partner: 'Ember',
    asks: 'Cash buy',
    offers: ['Sign-up', 'Identity', 'Due diligence', 'Cash buy', 'Sell at an ATM', 'Wallet'],
    checks: [
      ['Partner offers it', 'Yes', false],
      ['Identity', 'Verified', false],
      ['Due diligence', 'Not needed', false],
      ['Region', 'Texas, allowed', false],
    ],
    mounts: 'Cash buy',
    says: 'Mounts the flow',
  },
  {
    partner: 'Harbor',
    asks: 'Sell at an ATM',
    offers: ['Sign-up', 'Identity', 'Due diligence', 'Card buy', 'Sell at an ATM', 'Wallet'],
    checks: [
      ['Partner offers it', 'Yes', false],
      ['Identity', 'Verified', false],
      ['Due diligence', 'Required', true],
      ['Region', 'Ohio, allowed', false],
    ],
    mounts: 'Due diligence',
    says: 'Holds them: due diligence first',
  },
  {
    partner: 'Orchid',
    asks: 'Cash buy',
    offers: ['Sign-up', 'Identity', 'Due diligence', 'Cash buy', 'Wallet'],
    checks: [
      ['Partner offers it', 'Yes', false],
      ['Identity', 'Verified', false],
      ['Due diligence', 'Not needed', false],
      ['Region', 'Not confirmed', true],
    ],
    mounts: null,
    says: 'Not confirmed counts as no',
  },
]
const EACH = 4.8
const LENGTH = VISITS.length * EACH
const EDGE = 560
const FIELD_Y = 250
const CHECK = 0.55
const STEP = 0.32
const SEND = CHECK + 4 * STEP + 0.15
const ARRIVE = SEND + 0.65
const ROW = { y: 324, h: 38 }

export default function RouteFilm({ play }: { play: boolean | 'view' }) {
  const id = useId()
  return (
    <Film length={LENGTH} still={EACH + 3.6} play={play} label="The orchestrator checks each request and mounts a flow, holds the customer, or says no">
      {t => {
        const at = Math.min(VISITS.length - 1, Math.floor(t / EACH))
        const u = t - at * EACH
        const v = VISITS[at]
        const out = 1 - ramp(u, EACH - 0.35, EACH - 0.05)
        const travel = ramp(u, SEND, ARRIVE, x => x * x)
        // the chosen flow's row fills with paper from the left, the way the slats close
        const mount = ramp(u, ARRIVE, ARRIVE + 0.4, easeInOut)
        // drawn twice, in ink on the page and in paper over the block, so the request changes colour as it crosses
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

            {/* the orchestrator: the flows it can mount, as the partner's config leaves them */}
            <rect x={EDGE} width={960 - EDGE} height={600} fill={INK} />
            <text x={EDGE + 40} y={116} fontSize={52} fontWeight={500} letterSpacing={-1.3} fill={PAPER}>
              Orchestrator
            </text>
            <text x={EDGE + 40} y={152} fontSize={17} fill={PAPER} opacity={0.6}>
              Reads {v.partner}’s config
            </text>
            {u >= ARRIVE && (
              <text x={EDGE + 40} y={216} fontSize={17} fontWeight={500} fill={PAPER}>
                {v.says}
              </text>
            )}
            {FLOWS.map((f, i) => {
              const y = ROW.y + i * ROW.h
              const offered = v.offers.includes(f)
              const chosen = f === v.mounts
              const asked = f === v.asks
              return (
                <g key={f}>
                  <line x1={EDGE + 40} x2={920} y1={y} y2={y} stroke={PAPER} strokeOpacity={0.2} />
                  {chosen && mount > 0 && <rect x={EDGE} y={y} width={(960 - EDGE) * mount} height={ROW.h} fill={PAPER} />}
                  <text x={EDGE + 40} y={y + 25} fontSize={17} fill={chosen && mount >= 0.5 ? INK : PAPER} opacity={offered ? (chosen ? 1 : 0.6) : 0.2}>
                    {f}
                  </text>
                  {/* what was asked for, when it isn't what's mounted */}
                  {asked && !chosen && u >= ARRIVE && (
                    <text x={920} y={y + 25} fontSize={15} textAnchor="end" fill={PAPER} opacity={0.6}>
                      {v.mounts ? 'Held' : 'Not mounted'}
                    </text>
                  )}
                </g>
              )
            })}

            {/* the partner's app */}
            <text x={80} y={116} fontSize={64} fontWeight={500} letterSpacing={-1.6} fill={INK}>
              {v.partner}
            </text>
            <text x={80} y={FIELD_Y - 50} fontSize={16} fill={MUTED}>
              A customer asks for
            </text>
            <text x={80} y={FIELD_Y} fontSize={34} fontWeight={500} fill={u >= 0.2 ? INK : MUTED}>
              {u >= 0.2 ? v.asks : '—'}
            </text>
            {/* the request's line doesn't stop at the app: it runs on into the orchestrator */}
            {both(f => <line x1={80} x2={920} y1={FIELD_Y + 16} y2={FIELD_Y + 16} stroke={f} strokeWidth={1.5} strokeOpacity={f === INK ? 1 : 0.5} />)}
            {u >= SEND && u < ARRIVE && (
              <g opacity={1 - ramp(travel, 0.75, 1)}>
                {both(f => (
                  <text x={lerp(80, 860, travel)} y={FIELD_Y} fontSize={34} fontWeight={500} fill={f}>
                    {v.asks}
                  </text>
                ))}
              </g>
            )}

            <text x={80} y={380} fontSize={20} fontWeight={500} fill={INK}>
              What it checks first
            </text>
            {v.checks.map(([k, value, flag], i) => {
              const y = 430 + i * 40
              const shown = u >= CHECK + i * STEP
              return (
                <g key={k}>
                  <line x1={80} x2={520} y1={y - 28} y2={y - 28} stroke={RULE} />
                  <text x={80} y={y} fontSize={17} fill={MUTED}>
                    {k}
                  </text>
                  <text x={520} y={y} fontSize={17} fontWeight={flag ? 500 : 400} textAnchor="end" fill={shown ? INK : MUTED}>
                    {shown ? value : '—'}
                  </text>
                </g>
              )
            })}
            <line x1={80} x2={520} y1={562} y2={562} stroke={RULE} />
          </g>
        )
      }}
    </Film>
  )
}
