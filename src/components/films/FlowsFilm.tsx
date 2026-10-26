import { Film, INK, MUTED, RULE, Slats, Swap, easeInOut, lerp, mix, ramp } from '@/components/films/Film'

/**
 * One library of flows, a different app for every partner: the partner's colour closes over the app in slats,
 * and the flows its config picks leave the library one after another and settle into it. No new code.
 */

const FLOWS: [string, string][] = [
  ['Identity', 'Verify identity'],
  ['Cash buy', 'Buy with cash'],
  ['ATM cash-out', 'Cash out at an ATM'],
  ['Card buy', 'Buy with a card'],
  ['Wallet', 'Wallet'],
  ['Locations', 'Find a store'],
  ['History', 'History'],
]

const PARTNERS = [
  { name: 'Harbor', kind: 'A self-custody wallet', color: '#2f4bd8', flows: [0, 1, 5] },
  { name: 'Ember', kind: 'A cash-first app', color: '#e0531f', flows: [0, 1, 2, 5, 6] },
  { name: 'Orchid', kind: 'A full crypto app', color: '#a3247c', flows: [0, 1, 2, 3, 4, 5, 6] },
]
const EACH = 4.6

// the library runs along the bottom, one word after another; the app's rows stack in the panel
const LIB_Y = 548
const libX: number[] = []
FLOWS.reduce((x, [w]) => (libX.push(x), x + w.length * 9 + 46), 60)
const PANEL = { x: 560, h: 470, rows: 160, step: 42 }

export default function FlowsFilm({ play }: { play: boolean | 'view' }) {
  return (
    <Film length={PARTNERS.length * EACH} still={EACH * 2 + 3.2} play={play} label="Each partner's config picks its flows from one library">
      {t => {
        const at = Math.floor(t / EACH)
        const u = t % EACH
        const from = PARTNERS[(at + PARTNERS.length - 1) % PARTNERS.length]
        const p = PARTNERS[at]
        // the rows fade away together before the next partner
        const leave = ramp(u, EACH - 0.5, EACH - 0.1, easeInOut)
        return (
          <>
            {/* the config */}
            <Swap x={60} y={116} from={from.name} to={p.name} p={ramp(u, 0, 0.5)} fontSize={64} fontWeight={500} letterSpacing={-1.6} fill={INK} />
            <Swap x={60} y={152} from={from.kind} to={p.kind} p={ramp(u, 0.08, 0.58)} fontSize={17} fill={MUTED} />
            {(
              [
                ['Flows', `${from.flows.length} of ${FLOWS.length}`, `${p.flows.length} of ${FLOWS.length}`],
                ['New code', 'None', 'None'],
              ] as const
            ).map(([k, a, b], i) => {
              const y = 236 + i * 52
              return (
                <g key={k}>
                  <line x1={60} x2={440} y1={y - 32} y2={y - 32} stroke={RULE} />
                  <text x={60} y={y} fontSize={17} fill={MUTED}>
                    {k}
                  </text>
                  <Swap x={440} y={y} from={a} to={b} p={ramp(u, 0.2 + i * 0.07, 0.6 + i * 0.07)} textAnchor="end" fontSize={17} fill={INK} />
                </g>
              )
            })}
            <line x1={60} x2={440} y1={308} y2={308} stroke={RULE} />

            {/* the library */}
            <text x={60} y={508} fontSize={15} fill={MUTED}>
              The flow library, the same in every app
            </text>
            {FLOWS.map(([word], i) => {
              const k = p.flows.indexOf(i)
              const on = k < 0 ? 0 : ramp(u, 0.4 + k * 0.08, 0.7 + k * 0.08) * (1 - leave)
              return (
                <g key={word}>
                  <rect x={libX[i]} y={LIB_Y - 12} width={12} height={12} fill={p.color} opacity={on} />
                  <text x={libX[i] + 20} y={LIB_Y} fontSize={17} fill={on > 0.5 ? INK : MUTED}>
                    {word}
                  </text>
                </g>
              )
            })}

            {/* the partner's app: its colour closes over the last one in slats */}
            <rect x={PANEL.x} width={960 - PANEL.x} height={PANEL.h} fill={from.color} />
            <Slats x={PANEL.x} y={0} w={960 - PANEL.x} h={PANEL.h} fill={p.color} weight={i => 16 * ramp(u, i * 0.014, 0.36 + i * 0.014, easeInOut)} />
            <text x={PANEL.x + 40} y={112} fontSize={32} fontWeight={500} letterSpacing={-0.6} fill="#fff">
              Get crypto
            </text>
            {p.flows.map((f, k) => {
              const s = 0.95 + k * 0.15
              const go = ramp(u, s, s + 0.8, easeInOut)
              if (go === 0) return null
              const land = ramp(u, s + 0.7, s + 1)
              // the word leaves the library and arrives as the app's row
              const x = lerp(libX[f] + 20, PANEL.x + 40, go)
              const y = lerp(LIB_Y, PANEL.rows + k * PANEL.step, go)
              return (
                <g key={f} opacity={1 - leave}>
                  <text x={x} y={y} fontSize={lerp(17, 19, go)} fill={mix('#151514', '#ffffff', ramp(go, 0.5, 0.8))}>
                    {go < 1 ? FLOWS[f][0] : FLOWS[f][1]}
                  </text>
                  <line x1={PANEL.x + 40} x2={920} y1={y + 16} y2={y + 16} stroke="#fff" strokeOpacity={0.25 * land} />
                </g>
              )
            })}
          </>
        )
      }}
    </Film>
  )
}
