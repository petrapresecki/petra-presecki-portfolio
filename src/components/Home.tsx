import RollText from '@/components/kit/roll-text/RollText'
import ScrambleText from '@/components/kit/scramble-text/ScrambleText'
import { person, projects, type Project } from '@/data/site'
import { go } from '@/lib/route'
import { GridLines, Media } from './Parts'

const n = (i: number) => String(i + 1).padStart(2, '0')

export default function Home() {
  return (
    <main className="relative pt-[78px] max-md:pt-[92px]">
      <GridLines draw />
      <div className="relative z-10">
        {projects.map((p, i) => (
          <ProjectRow key={p.id} project={p} index={i} />
        ))}
        <Footer />
      </div>
    </main>
  )
}

function ProjectRow({ project: p, index }: { project: Project; index: number }) {
  const open = () => go({ page: 'project', id: p.id })
  return (
    <section id={p.id} className={index ? 'mt-20 max-md:mt-16' : 'mt-4'}>
      {/* the row's title bar */}
      <button onClick={open} className="group label cols w-full border-t border-rule py-2 text-left uppercase">
        <span className="flex items-center gap-1.5">
          <span className="text-muted">{n(index)}</span>
          <span className="size-[7px] scale-0 bg-accent transition-transform duration-300 group-hover:scale-100" />
          <span className="font-medium">{p.title}</span>
        </span>
        <span className="text-muted max-md:text-right">{p.kind}</span>
        <span className="text-muted max-md:hidden">{p.year}</span>
        <span className="justify-self-end max-md:hidden">
          <RollText text="Open fullscreen ↗" />
        </span>
      </button>

      {/* the recording across two columns, four smaller cells beside it */}
      <div className="cols mt-1 gap-y-[10px]">
        <button onClick={open} data-cursor="Open ↗" className="col-span-2 row-span-2 block text-left max-md:row-span-1">
          <Media media={p.hero} className="aspect-[16/10] h-full" />
        </button>
        {p.cells.map(c => (
          <button key={c.name} onClick={open} data-cursor="Open ↗" className="block text-left">
            <Media media={c} className="aspect-[16/10]" />
          </button>
        ))}
        {/* two wide clips under them */}
        {p.wide.map(c => (
          <button key={c.name} onClick={open} data-cursor="Open ↗" className="col-span-2 block text-left">
            <Media media={c} className="aspect-[16/10]" />
          </button>
        ))}
      </div>

      {/* what it is: a few lines, the facts one per line, the link */}
      <div className="cols mt-3 gap-y-3 text-[13px] leading-[1.5]">
        <p className="col-span-2 max-w-[54ch] bg-paper max-md:col-span-2">{p.summary}</p>
        <dl className="max-md:col-span-2">
          {p.facts.map(([k, v]) => (
            <div key={k} className="grid grid-cols-[4.5rem_1fr]">
              <dt className="label pt-[2px] text-muted">{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
        <div className="label flex flex-col items-end gap-1 max-md:col-span-2 max-md:items-start">
          {p.url ? (
            <a href={p.url} target="_blank" rel="noreferrer" className="group inline-flex hover:text-accent">
              <RollText text={`${p.url.replace(/^https?:\/\//, '').replace(/\/$/, '')} ↗`} />
            </a>
          ) : (
            <span className="text-muted">{p.note}</span>
          )}
          <button onClick={open} className="group inline-flex uppercase hover:text-accent md:hidden">
            <RollText text="Open fullscreen ↗" />
          </button>
        </div>
      </div>
    </section>
  )
}

/** Contact, in one row */
function Footer() {
  return (
    <footer className="mt-36 pb-16 max-md:mt-24">
      <div className="label cols border-t border-rule py-2">
        <span className="text-muted">Contact</span>
        <a href={`mailto:${person.email}`} className="truncate normal-case hover:text-accent max-md:text-right">
          <ScrambleText text={person.email} charDelay={18} />
        </a>
        <span className="flex gap-4 max-md:col-span-2 max-md:mt-2">
          <a href={person.linkedin} target="_blank" rel="noreferrer" className="group inline-flex hover:text-accent">
            <RollText text="LinkedIn ↗" />
          </a>
          <button onClick={() => go({ page: 'experience' })} className="group inline-flex uppercase hover:text-accent">
            <RollText text="CV ↗" />
          </button>
        </span>
        <span className="justify-self-end text-muted max-md:hidden">© 2026</span>
      </div>
    </footer>
  )
}
