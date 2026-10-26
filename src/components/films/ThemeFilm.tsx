import { Bar, Cap, Film, INK, MUTED, RULE, ramp } from '@/components/films/Film'

/**
 * One screen, four partners: each sends only the tokens it changes, the rest stay default, and the same
 * screen restyles itself. The overridden tokens wear the black bar.
 */

type Theme = { name: string; primary: string; surface: string; text: string; muted: string; line: string; radius: number; dark: boolean }

const BASE = { surface: '#ffffff', text: '#151514', muted: '#77746d', line: '#e6e4df', dark: false }
const THEMES: Theme[] = [
  { name: 'Default', primary: '#151514', radius: 4, ...BASE },
  { name: 'Harbor', primary: '#2f4bd8', radius: 22, ...BASE },
  { name: 'Ember', primary: '#e0531f', radius: 0, ...BASE, surface: '#fbf3ea' },
  { name: 'Orchid', primary: '#5cbfa5', radius: 12, surface: '#151514', text: '#f2f0ea', muted: '#9a968d', line: '#2e2d2a', dark: true },
]
const EACH = 3

const TOKENS: [string, (t: Theme) => string, boolean][] = [
  ['Primary', t => t.primary, true],
  ['Surface', t => t.surface, true],
  ['Text', t => t.text, true],
  ['Radius', t => `${t.radius}px`, false],
  ['Mode', t => (t.dark ? 'Dark' : 'Light'), false],
]

// a price line, drawn again for every partner
const CHART = [0, 18, 10, 30, 24, 46, 38, 52, 44, 70, 62, 78, 74, 96]
const chart = CHART.map((v, i) => `${632 + i * 17},${300 - v}`).join(' ')

const fade = (s: string) => ({ transition: 'fill .6s, stroke .6s, rx .6s, ry .6s', fill: s })

export default function ThemeFilm({ play }: { play: boolean | 'view' }) {
  return (
    <Film length={THEMES.length * EACH} still={EACH + 2.5} play={play} label="One screen restyled by four partner themes">
      {t => {
        const at = Math.floor(t / EACH)
        const u = t % EACH
        const th = THEMES[at]
        const sent = TOKENS.filter(([, get]) => get(th) !== get(THEMES[0])).length
        const r = th.radius
        const onPrimary = th.dark ? '#0f0f0e' : '#ffffff'
        return (
          <>
            {/* the tokens */}
            <Cap x={60} y={70} fill={MUTED}>
              / PARTNER THEME
            </Cap>
            <text x={60} y={128} fontSize={46} fontWeight={500} letterSpacing={-0.8} fill={INK} opacity={ramp(u, 0, 0.35)}>
              {th.name}
            </text>
            {TOKENS.map(([key, get, swatch], i) => {
              const y = 196 + i * 48
              const own = get(th) !== get(THEMES[0])
              return (
                <g key={key}>
                  <line x1={60} x2={420} y1={y - 26} y2={y - 26} stroke={RULE} />
                  {own ? (
                    <Bar x={60} y={y} text={key.toUpperCase()} />
                  ) : (
                    <Cap x={60} y={y} fill={MUTED}>
                      {key.toUpperCase()}
                    </Cap>
                  )}
                  {swatch && <rect x={300} y={y - 13} width={16} height={16} stroke={RULE} style={fade(get(th))} />}
                  <text x={420} y={y} fontSize={16} textAnchor="end" fill={INK} className="tabular-nums">
                    {get(th)}
                  </text>
                </g>
              )
            })}
            <line x1={60} x2={420} y1={410} y2={410} stroke={RULE} />
            <Cap x={60} y={456}>
              {sent ? `PARTNER SENDS ${sent} OF ${TOKENS.length} TOKENS` : 'NO OVERRIDES, ALL DEFAULTS'}
            </Cap>
            <Cap x={60} y={478} fill={MUTED}>
              {sent ? 'THE REST STAY DEFAULT' : 'THE STARTING POINT'}
            </Cap>
            <Cap x={60} y={556} fill={MUTED}>
              ONE CODEBASE · IOS · ANDROID · WEB
            </Cap>

            {/* the screen */}
            <rect x={600} y={24} width={290} height={552} rx={42} fill={INK} />
            <rect x={610} y={34} width={270} height={532} rx={34} style={fade(th.surface)} />
            <text x={634} y={68} fontSize={12} fontWeight={600} style={fade(th.text)}>
              9:41
            </text>
            <rect x={790} y={58} width={11} height={11} style={{ ...fade(th.primary), rx: Math.min(r, 5.5), ry: Math.min(r, 5.5) }} />
            <text x={808} y={68} fontSize={12} fontWeight={600} style={fade(th.text)}>
              {th.name}
            </text>

            <text x={634} y={114} fontSize={15} style={fade(th.muted)}>
              Bitcoin
            </text>
            <text x={634} y={150} fontSize={32} fontWeight={600} letterSpacing={-0.6} style={fade(th.text)}>
              $64,210.50
            </text>
            <text x={634} y={174} fontSize={13} fontWeight={500} style={fade(th.primary)}>
              +2.4% today
            </text>
            <polyline
              points={chart}
              fill="none"
              strokeWidth={2.5}
              strokeLinejoin="round"
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={1 - ramp(u, 0.15, 1.5)}
              style={{ stroke: th.primary, transition: 'stroke .6s' }}
            />

            {['1D', '1W', '1M', '1Y'].map((p, i) => (
              <g key={p}>
                {i === 1 && (
                  <rect x={634 + i * 56} y={326} width={48} height={26} opacity={0.16} style={{ ...fade(th.primary), rx: Math.min(r, 13), ry: Math.min(r, 13) }} />
                )}
                <text x={658 + i * 56} y={344} fontSize={12} fontWeight={i === 1 ? 600 : 400} textAnchor="middle" style={fade(i === 1 ? th.text : th.muted)}>
                  {p}
                </text>
              </g>
            ))}

            {['Cash', 'Card'].map((p, i) => (
              <g key={p}>
                <rect
                  x={634 + i * 114}
                  y={378}
                  width={106}
                  height={50}
                  strokeWidth={i ? 1 : 1.5}
                  style={{ fill: 'transparent', stroke: i ? th.line : th.primary, transition: 'stroke .6s, rx .6s, ry .6s', rx: Math.min(r, 14), ry: Math.min(r, 14) }}
                />
                <text x={687 + i * 114} y={408} fontSize={14} fontWeight={i ? 400 : 600} textAnchor="middle" style={fade(th.text)}>
                  {p}
                </text>
              </g>
            ))}

            <rect x={634} y={470} width={222} height={50} style={{ ...fade(th.primary), rx: Math.min(r, 25), ry: Math.min(r, 25) }} />
            <text x={745} y={500} fontSize={15} fontWeight={600} textAnchor="middle" style={fade(onPrimary)}>
              Buy Bitcoin
            </text>
            {[0, 1, 2, 3].map(i => (
              <rect key={i} x={662 + i * 50} y={540} width={14} height={4} style={{ ...fade(i ? th.line : th.primary), rx: 2, ry: 2 }} />
            ))}
          </>
        )
      }}
    </Film>
  )
}
