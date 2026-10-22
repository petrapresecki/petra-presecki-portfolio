import { useState } from 'react'

/**
 * The orchestrator, live: a partner's config picks the flows, the customer's region can only take
 * flows away, and a flagged customer gets the due-diligence questions first. Flows I built are marked.
 */

type FlowId = 'signin' | 'kyc' | 'edd' | 'debit' | 'cashbuy' | 'atm' | 'wallet' | 'locations' | 'history' | 'tax'

const FLOWS: { id: FlowId; name: string; mine?: boolean }[] = [
  { id: 'signin', name: 'Sign-in & profile' },
  { id: 'kyc', name: 'Identity verification', mine: true },
  { id: 'edd', name: 'Due-diligence questions', mine: true },
  { id: 'cashbuy', name: 'Buy with cash at a store', mine: true },
  { id: 'debit', name: 'Buy with a debit card' },
  { id: 'atm', name: 'Sell for cash at an ATM', mine: true },
  { id: 'wallet', name: 'Wallet & send', mine: true },
  { id: 'locations', name: 'Find a store or ATM' },
  { id: 'history', name: 'Transaction history' },
  { id: 'tax', name: 'Tax documents', mine: true },
]

const PARTNERS: { name: string; flows: FlowId[] }[] = [
  { name: 'A self-custody wallet', flows: ['signin', 'kyc', 'cashbuy', 'locations', 'history'] },
  { name: 'A cash-first app', flows: ['signin', 'kyc', 'cashbuy', 'atm', 'locations', 'history', 'tax'] },
  { name: 'A full crypto app', flows: ['signin', 'kyc', 'debit', 'cashbuy', 'atm', 'wallet', 'locations', 'history', 'tax'] },
]

/** what a restricted region takes away; it can never add */
const RESTRICTED: FlowId[] = ['atm', 'debit']

type State = 'on' | 'off' | 'region' | 'unflagged'

export default function FlowsDemo() {
  const [partner, setPartner] = useState(0)
  const [restricted, setRestricted] = useState(false)
  const [flagged, setFlagged] = useState(false)

  const picked = PARTNERS[partner].flows
  const state = (id: FlowId): State => {
    if (id === 'edd') return flagged ? 'on' : 'unflagged'
    if (!picked.includes(id)) return 'off'
    if (restricted && RESTRICTED.includes(id)) return 'region'
    return 'on'
  }
  const mounted = FLOWS.filter(f => state(f.id) === 'on').length

  return (
    <div className="grid gap-x-[var(--gap)] gap-y-8 md:grid-cols-9">
      <div className="md:col-span-3">
        <p className="label">Partner app</p>
        <div className="mt-1" role="radiogroup" aria-label="Partner app">
          {PARTNERS.map((p, i) => (
            <button
              key={p.name}
              role="radio"
              aria-checked={partner === i}
              onClick={() => setPartner(i)}
              className={`flex w-full justify-between py-2 text-left rule-top ${partner === i ? '' : 'text-muted'}`}
            >
              {p.name}
              <span>{partner === i ? '●' : ''}</span>
            </button>
          ))}
        </div>

        <p className="label mt-6">Customer</p>
        <div className="mt-1">
          <Toggle label="In a restricted state" on={restricted} set={setRestricted} />
          <Toggle label="Flagged for review" on={flagged} set={setFlagged} />
        </div>
      </div>

      <div className="md:col-span-6">
        <div className="flex items-baseline justify-between gap-4 border border-rule bg-paper px-3 py-2.5">
          <span>{PARTNERS[partner].name}</span>
          <span className="text-muted">iOS · Android · web</span>
        </div>
        <p className="label py-1.5 pl-3">↓ sends its config: brand, limits, flows</p>
        <div className="bg-ink px-3 py-2.5 text-paper">
          <span className="font-semibold">Orchestrator</span>
          <span className="opacity-70"> reads the config, applies the region’s rules, mounts the flows</span>
        </div>
        <p className="label py-1.5 pl-3">
          ↓ {mounted} flows mounted{flagged ? ', due diligence first' : ''}
        </p>
        <ul className="grid grid-cols-2 gap-1.5">
          {FLOWS.map(f => {
            const s = state(f.id)
            return (
              <li
                key={f.id}
                className={`flex min-h-[52px] flex-col justify-between border px-2.5 py-1.5 transition-[opacity,background-color,border-color] duration-300 ${
                  s === 'on' ? 'border-ink bg-paper' : 'border-dashed border-rule opacity-55'
                }`}
              >
                <span className={`flex justify-between gap-2 ${s === 'region' ? 'line-through' : ''}`}>
                  {f.name}
                  {f.mine && <span aria-label="built by me">●</span>}
                </span>
                <span className="label">
                  {s === 'on' ? 'Mounted' : s === 'region' ? 'Not allowed in this state' : s === 'unflagged' ? 'Only for flagged customers' : 'Not in this app'}
                </span>
              </li>
            )
          })}
        </ul>
        <p className="label mt-2">● Flows I built or co-built</p>
      </div>
    </div>
  )
}

function Toggle({ label, on, set }: { label: string; on: boolean; set: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      onClick={() => set(!on)}
      className={`flex w-full items-center justify-between py-2 text-left rule-top ${on ? '' : 'text-muted'}`}
    >
      {label}
      <span className={`relative h-3.5 w-6 border border-current transition-colors ${on ? 'bg-ink' : ''}`}>
        <span className={`absolute top-px size-2.5 transition-[left] ${on ? 'left-[11px] bg-paper' : 'left-px bg-current'}`} />
      </span>
    </button>
  )
}
