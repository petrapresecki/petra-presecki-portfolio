import { Film, INK, MUTED, PAPER, Slats, easeInOut, lerp, ramp } from '@/components/films/Film'

/**
 * A session with the team's agents. Above, the spine keeps the few repos a change touches out of all 27 (the
 * rest thin out) and the context it costs shrinks; below, one change runs from a command to a person merging it.
 */

const COLS = 9
const NEAR = [3, 11, 14, 22]
const SQ = 24
const GAP = 12

const STEPS: [string, string][] = [
  ['/ship PROJ-2241', 'One command, from the ticket'],
  ['Agent', 'Pinned model, only the tools it needs'],
  ['Checks', 'Typecheck, lint, tests'],
  ['Merge request', 'Ticket moved, team pinged'],
  ['AI review', 'Reads only what changed'],
  ['A person', 'Reviews and merges. Nothing ships on its own'],
]
const START = 3.6
const STEP = 1.2
const ROW = { y: 340, step: 44 }
const LENGTH = 14

const fmt = (n: number) => Math.round(n).toLocaleString('en-US')

export default function AgentsFilm({ play }: { play: boolean | 'view' }) {
  return (
    <Film length={LENGTH} still={12} play={play} label="The spine loads only the repos a change touches, then one change runs from a command to a person merging it">
      {t => {
        const out = 1 - ramp(t, LENGTH - 0.5, LENGTH - 0.05)
        const cut = ramp(t, 1.8, 3.0, easeInOut)
        // the marker eases from one step to the next
        const head = Math.min(STEPS.length - 1, Math.max(0, (t - START) / STEP))
        const at = Math.floor(head)
        const markerY = ROW.y + lerp(at, Math.min(STEPS.length - 1, at + 1), easeInOut(Math.min(1, (head - at) / 0.4))) * ROW.step
        return (
          <g opacity={out}>
            {/* the repos: the ones the spine skips thin out, column after column */}
            {Array.from({ length: 27 }, (_, i) => {
              const x = 60 + (i % COLS) * (SQ + GAP)
              const y = 64 + Math.floor(i / COLS) * (SQ + GAP)
              const appear = ramp(t, 0.2 + i * 0.02, 0.5 + i * 0.02)
              const thin = NEAR.includes(i) ? 0 : ramp(t, 1.6 + (i % COLS) * 0.05, 2.2 + (i % COLS) * 0.05, easeInOut)
              return <Slats key={i} x={x} y={y} w={SQ} h={SQ} pitch={6} fill={INK} weight={appear * lerp(6, 1.2, thin)} />
            })}
            {NEAR.map((i, k) => {
              const p = ramp(t, 1.4 + k * 0.1, 2.0 + k * 0.1, easeInOut)
              const x = 60 + (i % COLS) * (SQ + GAP) + SQ
              const y = 64 + Math.floor(i / COLS) * (SQ + GAP) + SQ / 2
              return p > 0 ? <line key={i} x1={400} y1={112} x2={lerp(400, x, p)} y2={lerp(112, y, p)} stroke={INK} /> : null
            })}
            <text x={410} y={118} fontSize={22} fontWeight={500} fill={INK} opacity={ramp(t, 1.1, 1.4)}>
              Spine
            </text>
            <text x={60} y={208} fontSize={15} fill={MUTED}>
              27 repos, 4 loaded
            </text>

            {/* the context it costs */}
            <Slats x={600} y={44} w={300 * lerp(1, 0.12, cut) * ramp(t, 0.2, 0.9, easeInOut)} h={56} pitch={8} weight={5} fill={INK} />
            <text x={600} y={150} fontSize={40} fontWeight={500} letterSpacing={-1} fill={INK} className="tabular-nums">
              {cut < 1 ? fmt(lerp(40600, 6500, cut)) : '2,500–6,500'}
            </text>
            <text x={600} y={180} fontSize={15} fill={MUTED}>
              {cut < 1 ? 'Tokens of context per session' : 'Tokens per session, 6–16× less'}
            </text>

            {/* one change, start to merge; the band arrives through slats that thicken into it */}
            <Slats x={0} y={240} w={960} h={40} pitch={8} fill={INK} weight={i => 1 + i * 1.5} />
            <rect y={280} width={960} height={320} fill={INK} />
            {t >= START && <rect x={40} y={markerY - 13} width={10} height={10} fill={PAPER} />}
            {STEPS.map(([title, sub], i) => {
              const y = ROW.y + i * ROW.step
              return (
                <g key={title} opacity={ramp(t, START + i * STEP - 0.1, START + i * STEP + 0.3, easeInOut) * 0.7 + 0.3}>
                  <text x={80} y={y} fontSize={24} fontWeight={500} letterSpacing={-0.3} fill={PAPER}>
                    {title}
                  </text>
                  <text x={340} y={y} fontSize={16} fill={PAPER} opacity={0.6}>
                    {sub}
                  </text>
                </g>
              )
            })}
          </g>
        )
      }}
    </Film>
  )
}
