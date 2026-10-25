import { useEffect, useState } from 'react'

/**
 * The whole workflow, from opening a session to a release: the spine loads context, skills hand work to agents
 * with pinned models, hooks and the translation MCP step in when they're needed, and a person always merges.
 */

type Step = { who: string; what: string; note?: string; code?: boolean; keys?: boolean }

const STEPS: Step[] = [
  { who: 'Session start', what: 'A hook loads the spine', note: 'a short compass, plus a card for each neighbouring repo' },
  { who: 'You', what: '/ticket', code: true, note: 'the discussion becomes Jira tickets, on a stronger model' },
  { who: 'You', what: '/ship PROJ-2241', code: true, note: 'the skill asks every question once, then hands over to an agent' },
  { who: 'Agent', what: 'Branch, change, then typecheck · lint · tests until green', note: 'pinned model, only the tools it needs' },
  { who: 'Hook', what: 'After the push: 3 translation keys missing', note: 'warns, never blocks the push', keys: true },
  { who: 'MCP', what: 'Creates the missing keys in Tolgee', note: 'asks before it changes a production value', keys: true },
  { who: 'Agent', what: 'Opens the MR, moves the ticket, posts to the team', note: 'GitLab · Jira · Slack' },
  { who: 'CI', what: 'The AI reviewer reads only what changed since its last pass' },
  { who: 'A person', what: 'Reviews and merges', note: 'nothing merges or deploys on its own' },
  { who: 'You', what: '/promote', code: true, note: 'in a throwaway worktree, stops if the code drifted; production stays a manual, QA-gated deploy' },
]

const KIT: [string, string][] = [
  ['Plugins', '2'],
  ['Slash-command skills', '17'],
  ['Agents, each with a pinned model', '11'],
  ['Hooks', 'post-push · session start'],
  ['MCP server', 'translations'],
  ['Shared rules synced into each repo', '10'],
]

export default function AgentDemo() {
  const [keys, setKeys] = useState(true)
  const [at, setAt] = useState(0)
  const [run, setRun] = useState(0)
  const steps = STEPS.filter(s => keys || !s.keys)

  // walk through the steps once per run; the last one stays lit
  useEffect(() => {
    setAt(0)
    const id = setInterval(() => setAt(i => (i < steps.length - 1 ? i + 1 : i)), 800)
    return () => clearInterval(id)
  }, [run, steps.length])

  return (
    <div className="grid gap-x-[var(--gap)] gap-y-10 md:grid-cols-9">
      <div className="md:col-span-5">
        <div className="flex items-baseline justify-between gap-4">
          <p className="label">The workflow, start to finish</p>
          <button className="link" onClick={() => setRun(r => r + 1)}>
            Replay
          </button>
        </div>
        <ol className="mt-1">
          {steps.map((s, i) => (
            <li
              key={s.what}
              className={`grid grid-cols-[6.5rem_1fr] gap-x-3 py-2 rule-top transition-opacity duration-300 ${i <= at ? '' : 'opacity-25'}`}
            >
              <span className={`label ${i === at ? 'text-ink' : ''}`}>
                {s.who}
              </span>
              <span>
                <span className={s.code ? 'code inline-block px-1.5 py-0' : ''}>{s.what}</span>
                {s.note && <span className="block text-muted">{s.note}</span>}
              </span>
            </li>
          ))}
        </ol>
        <button
          role="switch"
          aria-checked={keys}
          onClick={() => {
            setKeys(v => !v)
            setRun(r => r + 1)
          }}
          className={`mt-1 flex w-full items-center justify-between py-2 text-left rule-top ${keys ? '' : 'text-muted'}`}
        >
          The change adds new translation keys
          <span className={`relative h-3.5 w-6 border border-current transition-colors ${keys ? 'bg-ink' : ''}`}>
            <span className={`absolute top-px size-2.5 transition-[left] ${keys ? 'left-[11px] bg-paper' : 'left-px bg-current'}`} />
          </span>
        </button>
      </div>

      <div className="md:col-span-4">
        <p className="label">What’s in the team’s plugins</p>
        <dl className="mt-1">
          {KIT.map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4 py-1.5 rule-top">
              <dt className="text-muted">{k}</dt>
              <dd className="text-right tabular-nums">{v}</dd>
            </div>
          ))}
        </dl>

        <p className="label mt-8">Context loaded per session, across 27 repos</p>
        <div className="mt-2 space-y-2.5">
          <Bar label="Every repo’s notes" value="≈ 40,600 tokens" width={100} />
          <Bar label="With the context layer" value="2,500 – 6,500" width={16} from={6} />
        </div>
      </div>
    </div>
  )
}

function Bar({ label, value, width, from }: { label: string; value: string; width: number; from?: number }) {
  return (
    <div>
      <div className="flex justify-between gap-4">
        <span className="text-muted">{label}</span>
        <span className="tabular-nums">{value}</span>
      </div>
      <div className="relative mt-1 h-2 bg-mist">
        <div className="absolute inset-y-0 left-0 bg-ink" style={{ width: `${width}%` }} />
        {from !== undefined && <div className="absolute inset-y-0 left-0 bg-muted" style={{ width: `${from}%` }} />}
      </div>
    </div>
  )
}
