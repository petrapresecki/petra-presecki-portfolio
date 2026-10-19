import ScrambleText from '@/components/kit/scramble-text/ScrambleText'
import RollText from '@/components/kit/roll-text/RollText'
import { person, projects } from '@/data/site'
import { go, type Route } from '@/lib/route'

const nav: { label: string; to: Route }[] = [
  { label: `Work (${String(projects.length).padStart(2, '0')})`, to: { page: 'home' } },
  { label: 'Experience', to: { page: 'experience' } },
  { label: 'About', to: { page: 'about' } },
]

/** Four columns of small mono: who, what, where to go, how to reach. */
export default function Header({ route }: { route: Route }) {
  const at = (to: Route) => route.page === to.page

  return (
    <header className="label cols fixed inset-x-0 top-0 z-[60] bg-paper/92 pt-2.5 pb-3 backdrop-blur-sm">
      <div>
        <button onClick={() => go({ page: 'home' }, { top: true })} className="flex items-center gap-1.5 text-left uppercase">
          <span className="size-[7px] bg-ink" />
          <ScrambleText text={person.name} play="mount" />
        </button>
        <p className="pl-[13px] text-muted">Live, 2021 — 2026</p>
      </div>
      <div className="max-md:text-right">
        <ScrambleText text={person.role} play="mount" charDelay={30} />
        <p className="text-muted max-md:hidden">{person.stack}</p>
      </div>
      <nav className="max-md:col-span-2 max-md:mt-2">
        <ul className="flex flex-wrap gap-x-4">
          {nav.map(n => (
            <li key={n.label}>
              <button onClick={() => go(n.to)} className="group flex items-center gap-1.5 uppercase">
                <span className={`size-[7px] transition-colors ${at(n.to) ? 'bg-accent' : 'bg-transparent'}`} />
                <RollText text={n.label} />
              </button>
            </li>
          ))}
        </ul>
        <p className="pl-[13px] text-muted max-md:hidden">{person.place}</p>
      </nav>
      <div className="text-right max-md:hidden">
        <a href={`mailto:${person.email}`} className="group inline-flex hover:text-accent">
          <RollText text="Email ↗" />
        </a>
        <br />
        <button onClick={() => go({ page: 'experience' })} className="group inline-flex uppercase hover:text-accent">
          <RollText text="CV ↗" />
        </button>
      </div>
    </header>
  )
}
