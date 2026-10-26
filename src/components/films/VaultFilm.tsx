import { useId } from 'react'
import { Film, INK, MUTED, PAPER, RULE, Slats, easeInOut, lerp, ramp } from '@/components/films/Film'

/**
 * The SSN that never reaches the partner: the field sits in the partner's app, but its line runs on into the
 * vault, and every digit typed slides along it and in. The vault is the stripe mark, its disc's slats pulsing
 * while the number is stored. All that comes back is a customer ID.
 */

const SSN = '123456789'
const TYPE = 0.8
const KEY = 0.27
const TYPED = TYPE + SSN.length * KEY
const BACK = TYPED + 1.4
const HOME = BACK + 0.9
const LENGTH = HOME + 3
const ID = 'cus_7Hq2nX'
const EDGE = 620
const FIELD_Y = 250
const ID_Y = 482

/** 123-45-6789, all but the last four masked */
function masked(n: number) {
  const s = [...SSN.slice(0, n)].map((d, i) => (i < SSN.length - 4 ? '•' : d)).join('')
  return [s.slice(0, 3), s.slice(3, 5), s.slice(5)].filter(Boolean).join('-')
}

export default function VaultFilm({ play }: { play: boolean | 'view' }) {
  const id = useId()
  return (
    <Film length={LENGTH} still={HOME + 1} play={play} label="Each SSN digit goes straight into the vault; the app only gets a customer ID back">
      {t => {
        const out = 1 - ramp(t, LENGTH - 0.5, LENGTH - 0.05)
        const digits = Math.min(SSN.length, Math.max(0, Math.floor((t - TYPE) / KEY) + 1))
        // the disc breathes while it stores the number, then settles
        const storing = ramp(t, TYPED, TYPED + 0.3) * (1 - ramp(t, BACK - 0.3, BACK))
        const idX = lerp(900, 520, ramp(t, BACK, HOME, easeInOut))
        // drawn twice, in ink over the app and in paper over the vault, so a value changes colour as it crosses
        const both = (node: (fill: string) => React.ReactNode) => (
          <>
            <g clipPath={`url(#${id}-app)`}>{node(INK)}</g>
            <g clipPath={`url(#${id}-vault)`}>{node(PAPER)}</g>
          </>
        )
        return (
          <g opacity={out}>
            <clipPath id={`${id}-app`}>
              <rect width={EDGE} height={600} />
            </clipPath>
            <clipPath id={`${id}-vault`}>
              <rect x={EDGE} width={960 - EDGE} height={600} />
            </clipPath>

            {/* the vault: solid where it holds words, the stripe mark below */}
            <rect x={EDGE} width={960 - EDGE} height={300} fill={INK} />
            <Slats x={EDGE} y={300} w={960 - EDGE} h={300} fill={INK} thin={3 + 5 * storing * (0.5 + 0.5 * Math.sin(t * 6))} shape={<circle cx={790} cy={450} r={115} />} />
            <text x={EDGE + 40} y={116} fontSize={64} fontWeight={500} letterSpacing={-1.6} fill={PAPER}>
              Vault
            </text>
            <text x={EDGE + 40} y={152} fontSize={17} fill={PAPER} opacity={0.6}>
              Encrypted, in PCI DSS scope
            </text>

            {/* the partner's app */}
            <text x={80} y={116} fontSize={64} fontWeight={500} letterSpacing={-1.6} fill={INK}>
              Partner app
            </text>
            <text x={80} y={FIELD_Y - 50} fontSize={16} fill={MUTED}>
              Social Security number
            </text>
            <text x={80} y={FIELD_Y} fontSize={34} fontWeight={500} fill={digits && t >= TYPE ? INK : MUTED} letterSpacing={1} className="tabular-nums">
              {t >= TYPE ? masked(digits) : '•••-••-••••'}
            </text>
            {/* the field's line doesn't stop at the app: it runs into the vault */}
            {both(f => <line x1={80} x2={920} y1={FIELD_Y + 16} y2={FIELD_Y + 16} stroke={f} strokeWidth={1.5} strokeOpacity={f === INK ? 1 : 0.5} />)}
            {[...SSN].map((d, i) => {
              const s = TYPE + i * KEY
              // each digit speeds up as it goes, like something pulled in
              const p = ramp(t, s + 0.05, s + 0.7, x => x * x)
              if (t < s || p >= 1) return null
              return (
                <g key={i} opacity={1 - ramp(p, 0.75, 1)}>
                  {both(f => (
                    <text x={lerp(84 + masked(i + 1).length * 21, 880, p)} y={FIELD_Y} fontSize={34} fontWeight={500} fill={f}>
                      {d}
                    </text>
                  ))}
                </g>
              )
            })}

            <text x={80} y={380} fontSize={20} fontWeight={500} fill={INK}>
              What the app gets
            </text>
            <line x1={80} x2={520} y1={398} y2={398} stroke={RULE} />
            <text x={80} y={430} fontSize={17} fill={MUTED}>
              SSN
            </text>
            <text x={520} y={430} fontSize={17} textAnchor="end" fill={INK}>
              Never
            </text>
            <line x1={80} x2={520} y1={450} y2={450} stroke={RULE} />
            <text x={80} y={ID_Y} fontSize={17} fill={MUTED}>
              Customer ID
            </text>
            {t < BACK ? (
              <text x={520} y={ID_Y} fontSize={17} textAnchor="end" fill={MUTED}>
                —
              </text>
            ) : (
              both(f => (
                <text x={idX} y={ID_Y} fontSize={17} fontWeight={500} textAnchor="end" fill={f}>
                  {ID}
                </text>
              ))
            )}
            <line x1={80} x2={520} y1={502} y2={502} stroke={RULE} />
          </g>
        )
      }}
    </Film>
  )
}
