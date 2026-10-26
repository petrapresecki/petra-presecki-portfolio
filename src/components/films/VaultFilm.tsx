import { Bar, Cap, Film, INK, MUTED, PAPER, RULE, ramp } from '@/components/films/Film'

/**
 * The SSN that never reaches the partner: the field sits in the partner's app but belongs to the vault, so
 * every digit leaves straight for the vault, and all that comes back is a customer ID.
 */

const SSN = '123456789'
const TYPE = 0.7
const KEY = 0.27
const TYPED = TYPE + SSN.length * KEY
const SUBMIT = TYPED + 0.5
const BACK = SUBMIT + 1.4
const HOME = BACK + 1.1
const LENGTH = HOME + 3.4
const ID = 'cus_7Hq2nX'

/** 123-45-6789, all but the last four masked */
function masked(n: number) {
  const s = [...SSN.slice(0, n)].map((d, i) => (i < SSN.length - 4 ? '•' : d)).join('')
  return [s.slice(0, 3), s.slice(3, 5), s.slice(5)].filter(Boolean).join('-')
}

// the way back, from the vault into the app's result row
const BACK_PATH: [number, number][] = [
  [700, 400],
  [630, 400],
  [630, 532],
  [486, 532],
]
function along(p: number) {
  const segs = BACK_PATH.slice(1).map((b, i) => {
    const a = BACK_PATH[i]
    return { a, b, len: Math.hypot(b[0] - a[0], b[1] - a[1]) }
  })
  let d = p * segs.reduce((s, g) => s + g.len, 0)
  for (const g of segs) {
    if (d <= g.len) return [g.a[0] + ((g.b[0] - g.a[0]) * d) / g.len, g.a[1] + ((g.b[1] - g.a[1]) * d) / g.len]
    d -= g.len
  }
  return BACK_PATH[BACK_PATH.length - 1]
}

export default function VaultFilm({ play }: { play: boolean | 'view' }) {
  return (
    <Film length={LENGTH} still={HOME + 1} play={play} label="An SSN typed into a vault-hosted field; the app only gets a customer ID back">
      {t => {
        const digits = Math.min(SSN.length, Math.max(0, Math.floor((t - TYPE) / KEY) + 1))
        const state = t < TYPE ? 'EMPTY' : digits < SSN.length ? 'TOUCHED' : 'VALID'
        const sending = t >= SUBMIT && t < BACK
        const stored = ramp(t, SUBMIT + 0.9, SUBMIT + 1.2)
        const home = t >= HOME
        const [tx, ty] = along(ramp(t, BACK, HOME, x => x))
        const out = 1 - ramp(t, LENGTH - 0.5, LENGTH - 0.05)
        return (
          <g opacity={out}>
            {/* the partner's app */}
            <rect x={40} y={36} width={520} height={528} fill="none" stroke={INK} strokeDasharray="6 5" />
            <Cap x={64} y={72} fill={MUTED}>
              / PARTNER APP
            </Cap>
            <text x={80} y={128} fontSize={26} fontWeight={500} letterSpacing={-0.4} fill={INK}>
              Verify your identity
            </text>
            <text x={80} y={176} fontSize={14} fill={MUTED}>
              Social Security number
            </text>

            {/* the field: in the app, owned by the vault */}
            <rect x={80} y={190} width={406} height={56} fill={PAPER} stroke={INK} strokeWidth={1.5} />
            <text x={100} y={226} fontSize={22} fill={digits && t >= TYPE ? INK : MUTED} className="tabular-nums" letterSpacing={1}>
              {t >= TYPE ? masked(digits) : '•••-••-••••'}
            </text>
            <Bar x={476} y={224} text="VAULT FIELD" anchor="end" />

            <rect x={80} y={270} width={406} height={50} fill={INK} opacity={state === 'VALID' ? 1 : 0.1} style={{ transition: 'opacity .3s' }} />
            <text x={283} y={300} fontSize={15} fontWeight={500} textAnchor="middle" fill={state === 'VALID' ? PAPER : MUTED}>
              {sending ? 'Sending to the vault…' : home ? 'Verified' : 'Continue'}
            </text>

            <Cap x={80} y={404} fill={MUTED}>
              / WHAT THE APP RECEIVES
            </Cap>
            {(
              [
                ['RAW SSN', 'NEVER'],
                ['FIELD STATE', state],
                ['CUSTOMER ID', home ? ID : '—'],
              ] as const
            ).map(([k, v], i) => {
              const y = 452 + i * 40
              return (
                <g key={k}>
                  <line x1={80} x2={486} y1={y - 24} y2={y - 24} stroke={RULE} />
                  <Cap x={80} y={y} fill={MUTED}>
                    {k}
                  </Cap>
                  {i === 2 && home ? (
                    <Bar x={486} y={y} text={ID.toUpperCase()} anchor="end" />
                  ) : (
                    <Cap x={486} y={y} textAnchor="end" fill={v === '—' || v === 'EMPTY' ? MUTED : INK}>
                      {v}
                    </Cap>
                  )}
                </g>
              )
            })}

            {/* the way out: each digit straight to the vault */}
            <line x1={486} x2={700} y1={218} y2={218} stroke={INK} />
            <Cap x={593} y={204} textAnchor="middle" fill={MUTED}>
              RAW VALUE
            </Cap>
            {[...SSN].map((_, i) => {
              const s = TYPE + i * KEY
              const p = ramp(t, s, s + 0.5, x => x)
              if (p === 0 || p === 1) return null
              return <rect key={i} x={486 + p * 206} y={214} width={8} height={8} fill={INK} />
            })}

            {/* the vault */}
            <rect x={700} y={150} width={220} height={290} fill={INK} />
            <text x={722} y={198} fontSize={30} fontWeight={500} letterSpacing={-0.5} fill={PAPER}>
              Vault
            </text>
            <Cap x={722} y={226} fill={PAPER} opacity={0.6}>
              ENCRYPTED
            </Cap>
            <Cap x={722} y={246} fill={PAPER} opacity={0.6}>
              PCI DSS SCOPE STAYS HERE
            </Cap>
            <line x1={722} x2={898} y1={300} y2={300} stroke={PAPER} opacity={0.25} />
            <Cap x={722} y={326} fill={PAPER} opacity={0.6}>
              SSN
            </Cap>
            {sending && stored < 1 ? (
              [0, 1, 2].map(i => (
                <rect key={i} x={866 + i * 12} y={317} width={7} height={7} fill={PAPER} opacity={0.3 + 0.7 * ((Math.floor(t * 6) + i) % 3 === 0 ? 1 : 0)} />
              ))
            ) : (
              <Cap x={898} y={326} textAnchor="end" fill={PAPER} opacity={stored}>
                STORED
              </Cap>
            )}

            {/* the way back: only an ID */}
            <polyline points={BACK_PATH.map(p => p.join(',')).join(' ')} fill="none" stroke={INK} strokeDasharray="4 5" />
            <Cap x={640} y={474} fill={MUTED}>
              ID ONLY
            </Cap>
            {t >= BACK && !home && <rect x={tx - 5} y={ty - 5} width={10} height={10} fill={INK} />}
          </g>
        )
      }}
    </Film>
  )
}
