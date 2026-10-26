import { Film, INK, MUTED, RULE, Slats, Swap, easeInOut, lerp, mix, ramp } from '@/components/films/Film'

/**
 * One screen, four partners. Each sends only the tokens it changes: those values turn ink in the table, and
 * the new surface closes over the screen in slats before its colours and radius follow.
 */

type Theme = { name: string; primary: string; surface: string; text: string; muted: string; on: string; radius: number; dark: boolean }

const BASE = { surface: '#ffffff', text: '#151514', muted: '#77746d', on: '#ffffff', dark: false }
const THEMES: Theme[] = [
  { name: 'Default', primary: '#151514', radius: 4, ...BASE },
  { name: 'Harbor', primary: '#2f4bd8', radius: 30, ...BASE },
  { name: 'Ember', primary: '#e0531f', radius: 0, ...BASE, surface: '#fbf1e6' },
  { name: 'Orchid', primary: '#5cbfa5', radius: 12, surface: '#151514', text: '#f2f0ea', muted: '#9a968d', on: '#0f0f0e', dark: true },
]
const EACH = 3.6

const TOKENS: [string, (t: Theme) => string, boolean][] = [
  ['Primary', t => t.primary, true],
  ['Surface', t => t.surface, true],
  ['Text', t => t.text, true],
  ['Radius', t => `${t.radius}px`, false],
  ['Mode', t => (t.dark ? 'Dark' : 'Light'), false],
]

// the screen's column, and its price line
const S = { x: 580, w: 320 }
const CHART = [0, 18, 10, 30, 24, 46, 38, 52, 44, 70, 62, 78, 74, 96]
const chart = CHART.map((v, i) => `${S.x + (i * S.w) / (CHART.length - 1)},${380 - v * 1.4}`).join(' ')

export default function ThemeFilm({ play }: { play: boolean | 'view' }) {
  return (
    <Film length={THEMES.length * EACH} still={EACH + 2.6} play={play} label="One screen restyled by four partner themes">
      {t => {
        const at = Math.floor(t / EACH)
        const u = t % EACH
        const from = THEMES[(at + THEMES.length - 1) % THEMES.length]
        const to = THEMES[at]
        const blind = (i: number) => 16 * ramp(u, i * 0.012, 0.36 + i * 0.012, easeInOut)
        const wash = ramp(u, 0.45, 1, easeInOut)
        const c = (k: 'primary' | 'text' | 'muted' | 'on') => mix(from[k], to[k], wash)
        const r = lerp(from.radius, to.radius, wash)
        return (
          <>
            {/* the tokens the partner sends */}
            <Swap x={60} y={116} from={from.name} to={to.name} p={ramp(u, 0, 0.5)} fontSize={64} fontWeight={500} letterSpacing={-1.6} fill={INK} />
            {TOKENS.map(([key, get, swatch], i) => {
              const y = 222 + i * 52
              const own = get(to) !== get(THEMES[0])
              const p = ramp(u, 0.2 + i * 0.07, 0.6 + i * 0.07)
              return (
                <g key={key}>
                  <line x1={60} x2={440} y1={y - 32} y2={y - 32} stroke={RULE} />
                  <text x={60} y={y} fontSize={17} fill={MUTED}>
                    {key}
                  </text>
                  {swatch && <rect x={322} y={y - 15} width={18} height={18} fill={mix(get(from), get(to), p)} stroke={RULE} />}
                  <Swap x={440} y={y} from={get(from)} to={get(to)} p={p} textAnchor="end" fontSize={17} fill={own ? INK : MUTED} className="tabular-nums" />
                </g>
              )
            })}
            <line x1={60} x2={440} y1={450} y2={450} stroke={RULE} />

            {/* the screen it restyles */}
            <rect x={520} width={440} height={600} fill={from.surface} />
            <Slats x={520} y={0} w={440} h={600} fill={to.surface} weight={blind} />
            <text x={S.x} y={112} fontSize={17} fill={c('muted')}>
              Bitcoin
            </text>
            <text x={S.x} y={166} fontSize={48} fontWeight={500} letterSpacing={-1.4} fill={c('text')} className="tabular-nums">
              $64,210.50
            </text>
            <polyline points={chart} fill="none" stroke={c('primary')} strokeWidth={2.5} strokeLinejoin="round" />
            <rect x={S.x} y={470} width={S.w} height={62} rx={Math.min(r, 31)} fill={c('primary')} />
            <text x={S.x + S.w / 2} y={507} fontSize={18} fontWeight={500} textAnchor="middle" fill={c('on')}>
              Buy Bitcoin
            </text>
          </>
        )
      }}
    </Film>
  )
}
