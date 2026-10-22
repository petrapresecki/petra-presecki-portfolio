import { useEffect, useState } from 'react'

/**
 * How one command runs: the command asks up front, an agent with a pinned model and scoped tools
 * does the work, an open question comes back to the person, and it always ends in a merge request.
 */

type Step = { who: string; what: string; note?: string; loop?: boolean }

const STEPS: Step[] = [
  { who: 'You', what: '/ship PROJ-2241', note: 'in the middle of a conversation about the change' },
  { who: 'Command', what: 'Asks every question at once', note: 'target branch, template, reviewers; saved per repo on first run' },
  { who: 'Agent', what: 'Branch, change, then typecheck · lint · tests until green', note: 'pinned model, only the tools it needs' },
  { who: 'Agent → you', what: 'Needs input: “Split this into two tickets?”', note: 'the agent pauses, you answer, the same agent resumes', loop: true },
  { who: 'Tools', what: 'Push, open the MR, move the ticket, post to the team', note: 'git · GitLab · Jira · Slack' },
  { who: 'A person', what: 'Reviews and merges', note: 'nothing merges or deploys on its own' },
]

const KIT: [string, string][] = [
  ['Plugins', '2'],
  ['Commands', '17'],
  ['Agents, each with a pinned model', '11'],
  ['Hooks', 'post-push · session start'],
  ['MCP server', 'translations'],
  ['Shared rules synced into each repo', '10'],
]

export default function AgentDemo() {
  const [stuck, setStuck] = useState(true)
  const [at, setAt] = useState(0)
  const [run, setRun] = useState(0)
  const steps = STEPS.filter(s => stuck || !s.loop)

  // walk through the steps once per run; the last one stays lit
  useEffect(() => {
    setAt(0)
    const id = setInterval(() => setAt(i => (i < steps.length - 1 ? i + 1 : i)), 900)
    return () => clearInterval(id)
  }, [run, steps.length])

  return (
    <div className="grid gap-x-[var(--gap)] gap-y-10 md:grid-cols-9">
      <div className="md:col-span-5">
        <div className="flex items-baseline justify-between gap-4">
          <p className="label">One command, start to finish</p>
          <button className="link" onClick={() => setRun(r => r + 1)}>
            Replay
          </button>
        </div>
        <ol className="mt-1">
          {steps.map((s, i) => (
            <li
              key={s.what}
              className={`grid grid-cols-[6.5rem_1fr] gap-x-3 py-2 rule-top transition-opacity duration-300 ${i <= at ? '' : 'opacity-25'} ${
                s.loop ? 'pl-3' : ''
              }`}
            >
              <span className={`label ${i === at ? 'text-ink' : ''}`}>
                {s.loop ? '↺ ' : ''}
                {s.who}
              </span>
              <span>
                <span className={s.who === 'You' ? 'code inline-block px-1.5 py-0' : ''}>{s.what}</span>
                {s.note && <span className="block text-muted">{s.note}</span>}
              </span>
            </li>
          ))}
        </ol>
        <button
          role="switch"
          aria-checked={stuck}
          onClick={() => {
            setStuck(v => !v)
            setRun(r => r + 1)
          }}
          className={`mt-1 flex w-full items-center justify-between py-2 text-left rule-top ${stuck ? '' : 'text-muted'}`}
        >
          The agent hits an open question
          <span className={`relative h-3.5 w-6 border border-current transition-colors ${stuck ? 'bg-ink' : ''}`}>
            <span className={`absolute top-px size-2.5 transition-[left] ${stuck ? 'left-[11px] bg-paper' : 'left-px bg-current'}`} />
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
