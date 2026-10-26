import { Bar, Cap, Film, INK, MUTED, PAPER, RULE, lerp, ramp } from '@/components/films/Film'

/**
 * A session with the team's agents: the spine loads only the repos the work touches instead of all 27, then
 * one change runs from a slash command to a merge request, and a person merges it.
 */

const COLS = 9
const NEAR = [3, 11, 14, 22]

const STATIONS: { title: string; sub: string[]; command?: boolean }[] = [
  { title: '/SHIP', sub: ['ONE COMMAND'], command: true },
  { title: 'AGENT', sub: ['PINNED MODEL', 'SCOPED TOOLS'] },
  { title: 'CHECKS', sub: ['TYPECHECK', 'LINT', 'TESTS'] },
  { title: 'MERGE REQUEST', sub: ['TICKET MOVED', 'TEAM PINGED'] },
  { title: 'AI REVIEW', sub: ['READS ONLY', 'WHAT CHANGED'] },
  { title: 'A PERSON', sub: ['REVIEWS', 'AND MERGES'] },
]
const LINE = { y: 384, from: 80, to: 880 }
const stationX = (i: number) => lerp(LINE.from, LINE.to, i / (STATIONS.length - 1))
const START = 3.2
const STEP = 1.25
const LENGTH = 13

export default function AgentsFilm({ play }: { play: boolean | 'view' }) {
  return (
    <Film length={LENGTH} still={11} play={play} label="The spine loads only the repos a change touches, then one change runs from a command to a person merging it">
      {t => {
        const out = 1 - ramp(t, LENGTH - 0.5, LENGTH - 0.05)
        const all = ramp(t, 0.3, 1.1)
        const cut = ramp(t, 1.7, 2.6)
        const reached = (i: number) => t >= START + i * STEP
        const head = Math.min(STATIONS.length - 1, Math.max(0, (t - START) / STEP))
        const merged = ramp(t, START + (STATIONS.length - 1) * STEP + 0.6, START + (STATIONS.length - 1) * STEP + 0.9)
        return (
          <g opacity={out}>
            {/* the repos, and the few the spine loads */}
            <Cap x={60} y={60} fill={MUTED}>
              / 27 REPOS ON THE PLATFORM
            </Cap>
            {Array.from({ length: 27 }, (_, i) => {
              const x = 60 + (i % COLS) * 42
              const y = 88 + Math.floor(i / COLS) * 42
              const near = NEAR.includes(i)
              return (
                <g key={i}>
                  <rect x={x} y={y} width={16} height={16} fill={INK} opacity={near ? 0.12 + 0.88 * ramp(t, 2.0, 2.4) : 0.12 * all * (1 - cut)} />
                  <rect x={x} y={y} width={16} height={16} fill="none" stroke={near && t > 2 ? INK : RULE} />
                </g>
              )
            })}
            {NEAR.map((i, k) => {
              const x = 68 + (i % COLS) * 42
              const y = 96 + Math.floor(i / COLS) * 42
              const p = ramp(t, 1.3 + k * 0.1, 2.0 + k * 0.1)
              return <line key={i} x1={470} y1={146} x2={lerp(470, x + 9, p)} y2={lerp(146, y, p)} stroke={INK} opacity={p ? 1 : 0} />
            })}
            <g opacity={ramp(t, 1.0, 1.3)}>
              <Bar x={470} y={152} text="SPINE" />
              <Cap x={470} y={186} fill={MUTED}>
                LOADED AT SESSION START
              </Cap>
            </g>

            {/* the context it costs */}
            <Cap x={640} y={60} fill={MUTED}>
              / CONTEXT PER SESSION
            </Cap>
            <rect x={640} y={86} width={260} height={10} fill="none" stroke={RULE} />
            <rect x={640} y={86} width={260 * lerp(all, 0.12, cut)} height={10} fill={cut > 0.5 ? INK : MUTED} />
            <g opacity={1 - cut}>
              <text x={640} y={142} fontSize={24} fontWeight={500} letterSpacing={-0.3} fill={INK} className="tabular-nums">
                ≈ 40,600 tokens
              </text>
              <Cap x={640} y={166} fill={MUTED}>
                EVERY REPO’S NOTES
              </Cap>
            </g>
            <g opacity={cut}>
              <text x={640} y={142} fontSize={24} fontWeight={500} letterSpacing={-0.3} fill={INK} className="tabular-nums">
                2,500 – 6,500
              </text>
              <Cap x={640} y={166}>
                6–16× LESS
              </Cap>
            </g>

            <line x1={60} x2={900} y1={250} y2={250} stroke={RULE} />

            {/* one change, start to merge */}
            <Cap x={60} y={292} fill={MUTED}>
              / ONE CHANGE, START TO MERGE
            </Cap>
            <line x1={LINE.from} x2={LINE.to} y1={LINE.y} y2={LINE.y} stroke={RULE} />
            {t >= START && <line x1={LINE.from} x2={lerp(LINE.from, LINE.to, head / (STATIONS.length - 1))} y1={LINE.y} y2={LINE.y} stroke={INK} strokeWidth={1.5} />}
            {STATIONS.map((s, i) => {
              const x = stationX(i)
              const anchor = i === 0 ? 'start' : i === STATIONS.length - 1 ? 'end' : 'middle'
              const on = reached(i)
              const tx = i === 0 ? x - 6 : i === STATIONS.length - 1 ? x + 6 : x
              return (
                <g key={s.title} opacity={on ? 1 : 0.3}>
                  {s.command && on ? (
                    <Bar x={tx} y={358} text={s.title} />
                  ) : (
                    <Cap x={tx} y={358} textAnchor={anchor}>
                      {s.title}
                    </Cap>
                  )}
                  <rect x={x - 6} y={LINE.y - 6} width={12} height={12} fill={on ? INK : PAPER} stroke={INK} />
                  {s.sub.map((line, k) => {
                    // the checks pass one by one
                    const tick = s.title === 'CHECKS' && t >= START + i * STEP + 0.25 + k * 0.3
                    return (
                      <Cap key={line} x={tx} y={418 + k * 20} textAnchor={anchor} fill={tick ? INK : MUTED}>
                        {line}
                        {tick ? ' ✓' : ''}
                      </Cap>
                    )
                  })}
                </g>
              )
            })}
            <g opacity={merged}>
              <Bar x={LINE.to + 6} y={476} text="MERGED" anchor="end" />
            </g>
            <Cap x={60} y={556} fill={MUTED}>
              NOTHING MERGES OR DEPLOYS ON ITS OWN
            </Cap>
          </g>
        )
      }}
    </Film>
  )
}
