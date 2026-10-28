import { SPARK, Dotted, Film, Handle, INK, LEAD, MUTED, Node, Note, Orb, BUTTER, SAGE, along, curve, drift, ramp } from '@/components/films/Film'

/**
 * One widget, a different app for every partner. The flows sit around the orchestrator as nodes; a partner's config
 * decides which are lit and which are left as empty rings. A customer's request is a small light that leaves the
 * partner's app and passes the orchestrator's checks one by one. It is mounted into the flow it asked for, held in
 * due diligence first, or, when a check can't be confirmed, it fades at that gate: not confirmed counts as no.
 */

const FLOWS = ['Sign-up', 'Identity', 'Due diligence', 'Cash buy', 'Card buy', 'Sell at an ATM', 'Wallet']
const CHECKS = ['Offered', 'Identity', 'Due diligence', 'Region']

type Visit = {
  partner: string
  color: string
  asks: string
  offers: string[]
  /** the flow it ends up in, or the check it stops at */
  mounts: string | null
  stops?: number
  says: [string, string[]]
}
const VISITS: Visit[] = [
  { partner: 'Ember', color: BUTTER, asks: 'Cash buy', offers: ['Sign-up', 'Identity', 'Due diligence', 'Cash buy', 'Sell at an ATM', 'Wallet'], mounts: 'Cash buy', says: ['Mounted', ['Every check passed, so the', 'cash buy flow mounts']] },
  { partner: 'Harbor', color: SPARK, asks: 'Sell at an ATM', offers: ['Sign-up', 'Identity', 'Due diligence', 'Card buy', 'Sell at an ATM', 'Wallet'], mounts: 'Due diligence', says: ['Held', ['Flagged: due diligence comes', 'before any sale at an ATM']] },
  { partner: 'Orchid', color: SAGE, asks: 'Cash buy', offers: ['Sign-up', 'Identity', 'Due diligence', 'Cash buy', 'Wallet'], mounts: null, stops: 3, says: ['Nothing mounted', ['The region isn’t confirmed,', 'and not confirmed counts as no']] },
]
const EACH = 5
const LENGTH = VISITS.length * EACH

const START = [96, 300] as const
const GATES = CHECKS.map((_, i) => [196 + i * 74, 300] as const)
const HUB = [540, 300] as const
// the flows on an arc around the orchestrator
const FLOW_AT = FLOWS.map((_, i) => {
  const a = ((-62 + (i * 124) / (FLOWS.length - 1)) * Math.PI) / 180
  return [HUB[0] + 250 * Math.cos(a), HUB[1] + 250 * Math.sin(a)] as const
})

// when the request reaches each gate, then the orchestrator, then the flow
const AT_GATE = [0.9, 1.3, 1.75, 2.15]
const AT_HUB = 2.75
const MOUNTED = 3.5

export default function RouteFilm({ play }: { play: boolean | 'view' }) {
  return (
    <Film length={LENGTH} still={EACH + 4} play={play} label="The orchestrator checks each request and mounts a flow, holds the customer, or says no">
      {t => {
        const k = Math.min(VISITS.length - 1, Math.floor(t / EACH))
        const u = t - k * EACH
        const v = VISITS[k]
        const last = VISITS[(k + VISITS.length - 1) % VISITS.length]
        // the partner's config changes which flows are lit, a moment into its turn
        const config = ramp(u, 0, 0.6)
        const stop = v.stops ?? CHECKS.length
        // where the request is: along the checks, then out from the orchestrator to its flow
        const x = (() => {
          if (u < AT_GATE[0]) return [START[0] + (GATES[0][0] - START[0]) * ramp(u, 0.4, AT_GATE[0]), 300] as const
          for (let g = 0; g < CHECKS.length - 1; g++)
            if (u < AT_GATE[g + 1]) return g >= stop ? GATES[stop] : ([GATES[g][0] + 74 * ramp(u, AT_GATE[g] + 0.12, AT_GATE[g + 1]), 300] as const)
          if (stop < CHECKS.length) return GATES[stop]
          return [GATES[3][0] + (HUB[0] - GATES[3][0]) * ramp(u, AT_GATE[3] + 0.12, AT_HUB), 300] as const
        })()
        const target = v.mounts ? FLOW_AT[FLOWS.indexOf(v.mounts)] : null
        const out = target ? ([HUB, [HUB[0] + 120, target[1] + (HUB[1] - target[1]) * 0.15], target] as const) : null
        const leave = ramp(u, AT_HUB + 0.1, MOUNTED)
        const at = out && u > AT_HUB ? along(out, leave) : x
        // a request that can't pass a gate fades there
        const refused = v.mounts ? 0 : ramp(u, AT_GATE[stop] + 0.2, AT_GATE[stop] + 1.1)
        const merged = ramp(u, MOUNTED - 0.2, MOUNTED + 0.4)
        const said = ramp(u, v.mounts ? MOUNTED : AT_GATE[stop] + 0.6, (v.mounts ? MOUNTED : AT_GATE[stop] + 0.6) + 0.4)
        const fadeOut = 1 - ramp(u, EACH - 0.5, EACH)
        const [hx, hy] = drift(t, LENGTH, 5, 10)
        return (
          <g>
            {/* the orchestrator: a soft light of the partner it's serving, ringed, with its handle in the middle */}
            <Orb at={[HUB[0] + hx, HUB[1] + hy]} r={150} color={last.color} strength={0.5 * (1 - config)} />
            <Orb at={[HUB[0] + hx, HUB[1] + hy]} r={150} color={v.color} strength={0.5 * config} />
            <circle cx={HUB[0]} cy={HUB[1]} r={64} fill="none" stroke={INK} strokeWidth={2} strokeDasharray="4 4" />
            <Handle at={HUB} r={8} />
            <text x={HUB[0]} y={HUB[1] + 92} fontSize={16} fontWeight={600} letterSpacing={0.6} textAnchor="middle" fill={INK}>
              ORCHESTRATOR
            </text>

            {/* the partner, and what its customer asks for */}
            <text x={START[0] - 16} y={130} fontSize={56} fontWeight={500} letterSpacing={-1.4} fill={INK} opacity={ramp(u, 0, 0.4)}>
              {v.partner}
            </text>
            <text x={START[0] - 16} y={164} fontSize={16} fill={MUTED} opacity={ramp(u, 0, 0.4)}>
              A customer asks for {v.asks[0].toLowerCase() + v.asks.slice(1)}
            </text>

            {/* the checks, in order, on the way in */}
            <Dotted d={`M${START[0]},300 H${HUB[0] - 64}`} color={INK} opacity={0.45} />
            {CHECKS.map((c, g) => {
              const passed = u >= AT_GATE[g] + 0.1 && g < stop
              return <Node key={c} at={GATES[g]} label={c} color={INK} on={passed ? 1 : 0} side={g % 2 ? 'above' : 'below'} />
            })}

            {/* the flows; the partner's config lights the ones it offers */}
            {FLOWS.map((f, i) => {
              const offered = v.offers.includes(f)
              const before = last.offers.includes(f)
              const lit = (before ? 1 - config : 0) + (offered ? config : 0)
              const chosen = f === v.mounts
              return (
                <g key={f}>
                  {chosen && <Orb at={FLOW_AT[i]} r={30 + 46 * merged} color={v.color} strength={merged * fadeOut} />}
                  <Node at={FLOW_AT[i]} label={f} color={INK} on={lit} />
                </g>
              )
            })}
            {out && <Dotted d={curve(out)} p={ramp(u, AT_HUB - 0.1, AT_HUB + 0.4)} color={v.color} opacity={fadeOut} />}

            {/* the request itself */}
            {u > 0.3 && merged < 1 && <Orb at={at} r={38} color={v.color} strength={(1 - refused) * (1 - merged) * ramp(u, 0.3, 0.7)} />}
            <Note from={v.mounts ? [HUB[0] - 64, HUB[1]] : GATES[stop]} at={[110, 424]} width={330} color={LEAD.flows} label={v.says[0]} lines={v.says[1]} p={said * fadeOut} />
          </g>
        )
      }}
    </Film>
  )
}
