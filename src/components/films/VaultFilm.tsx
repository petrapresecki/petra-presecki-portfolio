import { SPARK, Dotted, Film, Handle, INK, LEAD, MUTED, Note, Orb, BUTTER, SAGE, RULE, along, curve, drift, ramp } from '@/components/films/Film'

/**
 * The SSN that never reaches the partner. A dotted rule splits the stage: the partner's app on the left, the vault
 * on the right as a pool of light. The field sits in the app but belongs to the vault, so each digit typed leaves it
 * as a small orb of light, crosses the rule and is taken into the vault. The app keeps only dots, and what comes
 * back across is a customer ID.
 */

const SSN = '123456789'
const TYPE = 0.8
// typed the way people type an SSN: in its three groups, quick inside a group, a beat between them
const KEYS = [0, 0.17, 0.36, 0.88, 1.03, 1.58, 1.74, 1.93, 2.08].map(k => TYPE + k)
const CROSS = 1.0
const LANDS = KEYS.map(k => k + CROSS)
const SEND = LANDS[LANDS.length - 1] + 0.35
const BACK = SEND + 0.6
const HOME = BACK + 0.9
const CLEAR = 8.7
const LENGTH = 10
const ID = 'cus_7Hq2nX'

const RULE_X = 520
const VAULT = [748, 300] as const
const FIELD = { x: 80, y: 292 }
const ID_AT = [420, 496] as const

/** 123-45-6789 with all but the last four as dots */
function masked(n: number) {
  const s = [...SSN.slice(0, n)].map((d, i) => (i < SSN.length - 4 ? '•' : d)).join('')
  return [s.slice(0, 3), s.slice(3, 5), s.slice(5)].filter(Boolean).join('-')
}

export default function VaultFilm({ play }: { play: boolean | 'view' }) {
  return (
    <Film length={LENGTH} still={7} play={play} label="Each SSN digit crosses straight into the vault; the app only gets a customer ID back">
      {t => {
        const typed = KEYS.filter(k => t >= k).length * (t < CLEAR ? 1 : 0)
        const clear = 1 - ramp(t, CLEAR, CLEAR + 0.6)
        // the vault takes each digit in and grows a little with it, then lets the size go between rounds
        const held = (LANDS.filter(l => t >= l).length / SSN.length) * (1 - ramp(t, CLEAR, LENGTH))
        const [vx, vy] = drift(t, LENGTH, 1, 10)
        const [px, py] = drift(t, LENGTH, 2, 22)
        const back = ramp(t, BACK, HOME)
        const backPath = [[VAULT[0] - 40, VAULT[1] + 60], [RULE_X, 520], ID_AT] as const
        return (
          <g>
            {/* the vault, as light */}
            <Orb at={[VAULT[0] - 20 + vx, VAULT[1] + 30 + vy]} r={200 + held * 24} color={SAGE} strength={0.85 + held * 0.15} />
            <Orb at={[VAULT[0] + 30 - vx, VAULT[1] - 20 - vy]} r={120 + held * 18} color={SPARK} strength={0.45 + held * 0.3} />
            <Orb at={[VAULT[0] - 80 + px, VAULT[1] + 110 + py]} r={70} color={BUTTER} />

            {/* the boundary */}
            <Dotted d={`M${RULE_X},36 V564`} color={INK} opacity={0.5} dash={3} />
            <text x={80} y={72} fontSize={16} fontWeight={600} letterSpacing={0.6} fill={INK}>
              PARTNER APP
            </text>
            <text x={VAULT[0]} y={VAULT[1] + 20} fontSize={64} fontWeight={500} letterSpacing={-1.6} textAnchor="middle" fill={INK}>
              Vault
            </text>
            <text x={VAULT[0]} y={VAULT[1] + 52} fontSize={15} textAnchor="middle" fill={INK} opacity={0.6}>
              Encrypted, in PCI DSS scope
            </text>

            {/* the field: in the app, owned by the vault */}
            <Note from={[470, FIELD.y + 18]} at={[190, 92]} width={310} color={LEAD.sdk} label="A vault-hosted field" lines={['It belongs to the vault, so the', 'app’s code never sees a digit']} />
            <text x={FIELD.x} y={FIELD.y - 48} fontSize={16} fill={MUTED}>
              Social Security number
            </text>
            <text x={FIELD.x} y={FIELD.y} fontSize={44} fontWeight={500} letterSpacing={1} fill={typed ? INK : MUTED} opacity={typed ? clear : 1} className="tabular-nums">
              {typed ? masked(typed) : '•••-••-••••'}
            </text>
            <line x1={FIELD.x} x2={470} y1={FIELD.y + 18} y2={FIELD.y + 18} stroke={INK} strokeWidth={1.5} />

            {/* every digit leaves the field as light, crosses the rule and goes into the vault */}
            {[...SSN].map((d, i) => {
              const p = ramp(t, KEYS[i] + 0.05, LANDS[i])
              if (t < KEYS[i] || p >= 1) return null
              const from = [FIELD.x + 12 + masked(i + 1).length * 25, FIELD.y - 14] as const
              const path = [from, [RULE_X, i % 2 ? 150 : 430], [VAULT[0] + vx, VAULT[1] + vy]] as const
              const at = along(path, p)
              const fade = 1 - ramp(p, 0.7, 1)
              return (
                <g key={i}>
                  <Dotted d={curve(path)} p={Math.min(1, p * 1.4)} color={SPARK} opacity={0.45 * fade} />
                  <Orb at={at} r={34} color={SAGE} strength={fade} />
                  <text x={at[0]} y={at[1] + 7} fontSize={20} fontWeight={600} textAnchor="middle" fill={INK} opacity={fade}>
                    {d}
                  </text>
                </g>
              )
            })}

            {/* what the app holds */}
            <text x={80} y={398} fontSize={16} fill={MUTED}>
              What the app gets
            </text>
            <Dotted d="M80,418 H470" color={RULE} dash={2} />
            <text x={80} y={450} fontSize={18} fill={INK}>
              SSN
            </text>
            <text x={470} y={450} fontSize={18} textAnchor="end" fill={INK}>
              Never
            </text>
            <Dotted d="M80,470 H470" color={RULE} dash={2} />
            <text x={80} y={502} fontSize={18} fill={INK}>
              Customer ID
            </text>
            <text x={470} y={502} fontSize={18} fontWeight={600} textAnchor="end" fill={INK} opacity={t >= HOME && t < CLEAR + 0.6 ? clear : 0}>
              {ID}
            </text>
            <text x={470} y={502} fontSize={18} textAnchor="end" fill={MUTED} opacity={t >= HOME ? 1 - clear : 1}>
              —
            </text>
            <Dotted d="M80,522 H470" color={RULE} dash={2} />

            {/* and all that crosses back: an ID */}
            <Dotted d={curve(backPath)} p={ramp(t, SEND, BACK)} color={INK} opacity={0.5 * (1 - ramp(t, HOME + 0.6, HOME + 1.4))} />
            {back > 0 && back < 1 && <Handle at={along(backPath, back)} />}
          </g>
        )
      }}
    </Film>
  )
}

