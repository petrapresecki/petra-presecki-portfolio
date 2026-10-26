import type { Case } from '@/data/site'
import DesignSystemDemo from '@/components/DesignSystemDemo'
import AgentDemo from '@/components/AgentDemo'

/** The small exhibit beside each case study */
export default function Exhibit({ kind }: { kind: NonNullable<Case['visual']> }) {
  if (kind === 'theme') return <DesignSystemDemo />
  if (kind === 'agent') return <AgentDemo />
  return <SdkSnippet />
}

// ---- sdk: the partner's code only ever sees a token

function SdkSnippet() {
  return (
    <figure>
      <p className="label">Partner code</p>
      <pre className="code mt-1">{`<OnboardingProvider config={config}>
  <SsnField />        // hosted by the vault
  <SubmitButton />
</OnboardingProvider>

onComplete({ customerId })
// the raw SSN never reaches this app`}</pre>
      <p className="label mt-4">What the app can read</p>
      <dl className="mt-1">
        {[
          ['Field value', 'Never'],
          ['Field state', 'valid · empty · touched'],
          ['Result', 'A customer ID or a typed error'],
        ].map(([k, v], i) => (
          <div key={k} className={`flex justify-between gap-4 py-1.5 ${i ? 'rule-top' : ''}`}>
            <dt className="text-muted">{k}</dt>
            <dd className="text-right">{v}</dd>
          </div>
        ))}
      </dl>
    </figure>
  )
}
