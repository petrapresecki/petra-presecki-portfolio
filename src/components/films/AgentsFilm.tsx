import { Dotted, Film, GREY, Handle, INK, MOSS, MUTED, Node, Note, Orb, SAGE, drift, lerp, ramp } from '@/components/films/Film'

/**
 * How the team works with agents. Above: without the spine a session would load all 27 repos; the spine looks up the
 * few a change touches, one after another, the rest go out together, and the context it costs condenses from a wide
 * pale light into a small bright one. Below: one change travels from a command to a merge, waiting at each step about
 * as long as that step takes, and it only lands when a person closes the ring.
 */

const COLS = 9
const NEAR = [3, 11, 14, 22]
const LOOKUPS = [0.6, 0.9, 1.05, 1.4]
const DROP = 1.8

const STEPS: [string, string, number][] = [
  ['/ship', 'One command, from the ticket', 0.6],
  ['Agent', 'Pinned model, only the tools it needs', 1.8],
  ['Checks', 'Typecheck, lint, tests', 1.3],
  ['Merge request', 'Ticket moved, team pinged', 0.6],
  ['AI review', 'Reads only what changed', 1.1],
  ['A person', 'Waiting for a review', 0],
]
const START = 2.8
const BEGINS = STEPS.map((_, i) => START + STEPS.slice(0, i).reduce((sum, s) => sum + s[2], 0))
const PERSON = BEGINS[BEGINS.length - 1]
const LENGTH = PERSON + 3.8
const RESET = LENGTH - 1

const repo = (i: number) => [86 + (i % COLS) * 30, 92 + Math.floor(i / COLS) * 34] as const
const SPINE = [400, 126] as const
const PATH_Y = 452
const stop = (i: number) => [96 + i * 158, PATH_Y] as const

export default function AgentsFilm({ play }: { play: boolean | 'view' }) {
  return (
    <Film length={LENGTH} still={PERSON + 2} play={play} label="The spine loads only the repos a change touches, then one change runs from a command to a person merging it">
      {t => {
        const back = ramp(t, RESET, LENGTH - 0.05)
        const drop = ramp(t, DROP, DROP + 0.6) * (1 - back)
        const at = BEGINS.filter(b => t >= b).length - 1
        // the change moves on when a step is done, and settles into each stop
        const x =
          at < 0 ? stop(0)[0] : at === 0 || t >= BEGINS[at] + 0.45 ? stop(at)[0] : lerp(stop(at - 1)[0], stop(at)[0], ramp(t, BEGINS[at] - 0.45, BEGINS[at]))
        const moving = at > 0 && t < BEGINS[at] && t > BEGINS[at] - 0.45
        const ring = ramp(t, PERSON + 0.2, PERSON + 1.2) * (1 - back)
        const [cx, cy] = drift(t, LENGTH, 6, 10)
        const [sx, sy] = drift(t, LENGTH, 7, 8)
        const step = at < 0 ? null : STEPS[at]
        return (
          <g>
            {/* the context a session costs, as light: wide and pale with everything loaded, small and bright with the spine */}
            <Orb at={[730 + cx, 128 + cy]} r={lerp(170, 92, drop)} color={MOSS} strength={lerp(0.5, 1, drop)} />
            <Orb at={[760 + sx, 108 + sy]} r={lerp(90, 46, drop)} color={SAGE} strength={lerp(0.4, 0.9, drop)} />
            <text x={730} y={140} fontSize={40} fontWeight={500} letterSpacing={-1} textAnchor="middle" fill={INK} className="tabular-nums">
              {drop < 1 ? '40,600' : '2,500–6,500'}
            </text>
            <text x={730} y={172} fontSize={15} textAnchor="middle" fill={INK} opacity={0.65}>
              {drop < 1 ? 'tokens of context per session' : 'tokens per session, 6–16× less'}
            </text>

            {/* the repos and the spine */}
            {NEAR.map((i, k) => (
              <Dotted key={i} d={`M${SPINE[0]},${SPINE[1]} L${repo(i)[0]},${repo(i)[1]}`} p={ramp(t, LOOKUPS[k], LOOKUPS[k] + 0.35) * (1 - back)} color={MOSS} />
            ))}
            {Array.from({ length: 27 }, (_, i) => {
              const near = NEAR.indexOf(i)
              const found = near >= 0 ? ramp(t, LOOKUPS[near] + 0.25, LOOKUPS[near] + 0.5) * (1 - back) : 0
              return <Node key={i} at={repo(i)} color={found ? MOSS : GREY} on={near >= 0 ? 1 : 1 - drop} />
            })}
            <Handle at={SPINE} r={8} />
            <text x={SPINE[0] + 18} y={SPINE[1] + 5} fontSize={16} fontWeight={600} letterSpacing={0.6} fill={INK}>
              SPINE
            </text>
            <text x={80} y={212} fontSize={15} fill={MUTED}>
              {drop < 1 ? '27 repos' : '27 repos, 4 loaded'}
            </text>

            {/* one change, from a command to a merge */}
            <Dotted d={`M${stop(0)[0]},${PATH_Y} H${stop(5)[0]}`} color={INK} opacity={0.45} />
            <text x={80} y={362} fontSize={24} fontWeight={500} letterSpacing={-0.3} fill={INK} opacity={step ? 1 - back : 0}>
              {step?.[1]}
            </text>
            {STEPS.map(([title], i) =>
              i === STEPS.length - 1 ? null : <Node key={title} at={stop(i)} label={title} color={INK} on={t >= BEGINS[i] && back < 1 ? 1 : 0} side="below" />,
            )}
            {at >= 0 && <Orb at={[x, PATH_Y]} r={moving ? 34 : 44} color={MOSS} strength={(at === STEPS.length - 1 ? 1 - ring * 0.5 : 1) * (1 - back)} />}

            {/* the last step is a person's: the change waits until they close the ring */}
            <circle
              cx={stop(5)[0]}
              cy={PATH_Y}
              r={26}
              fill="none"
              stroke={INK}
              strokeWidth={2}
              strokeDasharray="4 4"
              opacity={0.35 + 0.65 * ring}
            />
            {ring > 0 && (
              <circle
                cx={stop(5)[0]}
                cy={PATH_Y}
                r={26}
                fill="none"
                stroke={INK}
                strokeWidth={2}
                pathLength={1}
                strokeDasharray={`${ring} 1`}
                transform={`rotate(-90 ${stop(5)[0]} ${PATH_Y})`}
              />
            )}
            <Handle at={stop(5)} r={8} />
            <text x={stop(5)[0]} y={PATH_Y + 50} fontSize={16} fontWeight={600} letterSpacing={0.6} textAnchor="middle" fill={INK}>
              A PERSON
            </text>
            <Note
              from={[stop(5)[0], PATH_Y - 26]}
              at={[610, 248]}
              width={300}
              color={MOSS}
              label="Merged by a person"
              lines={['Every path ends in a review.', 'Nothing ships on its own']}
              p={ramp(t, PERSON + 1.1, PERSON + 1.9) * (1 - back)}
            />
          </g>
        )
      }}
    </Film>
  )
}
