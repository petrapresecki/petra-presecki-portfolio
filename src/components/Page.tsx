import { useEffect, useRef, useState } from 'react'
import { about, cases, experience, person, projects, skills, type Case, type Project } from '@/data/site'
import Exhibit from '@/components/Exhibits'
import View from '@/components/View'
import { getLenis } from '@/lib/kit/lenis'

const NAV = [
  ['experience', 'Experience'],
  ['work', 'Side work'],
  ['about', 'About'],
  ['contact', 'Contact'],
] as const

type Open = { kind: 'case'; id: string } | { kind: 'project'; id: string } | null

/** The whole site on one page: who, experience, side work, about, contact. A closer look at Coinme work and side projects opens in a full-screen view. */
export default function Page() {
  const [open, setOpen] = useState<Open>(null)
  const show = setOpen
  const openCase = (id: string) => show({ kind: 'case', id })
  const study = open?.kind === 'case' ? cases.find(c => c.id === open.id) : undefined
  const project = open?.kind === 'project' ? projects.find(p => p.id === open.id) : undefined

  return (
    <main>
      <header className="grid-12 pt-5 pb-24 md:pb-36">
        <div className="col-span-6 md:col-span-3">
          <p className="font-semibold">{person.name}</p>
          <p className="text-muted">{person.role}</p>
        </div>
        <nav className="col-span-6 md:col-span-3" aria-label="Sections">
          {NAV.map(([target, label]) => (
            <a
              key={target}
              href={`#${target}`}
              className="link block w-fit"
              onClick={e => {
                e.preventDefault()
                getLenis()?.scrollTo(`#${target}`, { duration: 1.2 })
              }}
            >
              {label}
            </a>
          ))}
        </nav>
        <div className="col-span-6 mt-4 md:col-[10/span_3] md:mt-0 md:text-right">
          <p>Zagreb, CET</p>
          <Clock />
        </div>
      </header>

      <section className="grid-12 pb-20 md:pb-32">
        <h1 className="statement col-span-12 md:col-[4/span_8]">
          Frontend engineer. I build the foundations other teams and partners build on: design systems, regulated
          product flows, partner SDKs and AI agent tooling. Five years in React, React Native and TypeScript, most
          recently at Coinme, now part of{' '}
          <a className="link" href="https://polygon.technology/" target="_blank" rel="noreferrer">
            Polygon Labs
          </a>
          .
        </h1>
        <div className="col-span-12 mt-8 flex flex-wrap gap-x-6 gap-y-1 md:col-[4/span_8]">
          <a className="link" href={`mailto:${person.email}`}>
            {person.email}
          </a>
          <a className="link" href={person.cv} target="_blank" rel="noreferrer">
            CV (PDF)
          </a>
          <a className="link" href={person.linkedin} target="_blank" rel="noreferrer">
            LinkedIn
          </a>
          <a className="link" href={person.github} target="_blank" rel="noreferrer">
            GitHub
          </a>
        </div>
      </section>

      <section id="experience" className="grid-12 rule-top py-5">
        <h2 className="label col-span-12 md:col-span-3">Experience</h2>
        <div className="col-span-12 mt-4 md:col-span-9 md:mt-0">
          {experience.map((job, i) => (
            <Job key={job.company} job={job} first={i === 0} onCase={openCase} />
          ))}
        </div>
      </section>

      <section className="grid-12 rule-top py-5">
        <h2 className="label col-span-12 md:col-span-3">Capabilities</h2>
        <dl className="col-span-12 mt-4 md:col-span-9 md:mt-0">
          {skills.map(([k, v], i) => (
            <div key={k} className={`grid grid-cols-9 gap-x-[var(--gap)] py-1.5 ${i ? 'rule-top' : ''}`}>
              <dt className="col-span-9 md:col-span-3">{k}</dt>
              <dd className="col-span-9 text-muted md:col-span-6">{v}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section id="work" className="side rule-top mt-24 py-5 md:mt-36">
        <div className="grid-12">
          <h2 className="label col-span-12 md:col-span-3">Side work</h2>
          <p className="col-span-12 mt-2 md:col-span-6 md:mt-0">
            Look what I made. Sites for creative people and my own library of motion blocks, built outside client
            work.
          </p>
        </div>
        <div className="grid-12 mt-10 gap-y-12">
          {projects.map(p => (
            <Still key={p.id} project={p} onOpen={() => show({ kind: 'project', id: p.id })} />
          ))}
        </div>
      </section>

      <section id="about" className="grid-12 rule-top mt-24 py-5 md:mt-36">
        <h2 className="label col-span-12 md:col-span-3">About</h2>
        <div className="col-span-12 mt-4 space-y-4 md:col-span-5 md:mt-0">
          {about.lines.map(line => (
            <p key={line}>{line}</p>
          ))}
        </div>
        <dl className="col-span-12 mt-8 md:col-[10/span_3] md:mt-0">
          {about.facts.map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4 py-1 rule-bottom">
              <dt className="text-muted">{k}</dt>
              <dd className="text-right">{v}</dd>
            </div>
          ))}
        </dl>
      </section>

      <footer id="contact" className="grid-12 rule-top mt-24 pt-5 pb-10 md:mt-36">
        <h2 className="label col-span-12 md:col-span-3">Contact</h2>
        <div className="col-span-12 mt-3 md:col-span-9 md:mt-0">
          <a className="statement link" href={`mailto:${person.email}`}>
            {person.email}
          </a>
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-1">
            <a className="link" href={person.linkedin} target="_blank" rel="noreferrer">
              LinkedIn
            </a>
            <a className="link" href={person.github} target="_blank" rel="noreferrer">
              GitHub
            </a>
            <a className="link" href={person.cv} target="_blank" rel="noreferrer">
              CV (PDF)
            </a>
          </div>
        </div>
        <p className="col-span-12 mt-32 text-muted md:col-[10/span_3] md:text-right">© 2026 {person.name}</p>
      </footer>

      {study && <CaseView key={study.id} study={study} onClose={() => show(null)} onCase={openCase} />}
      {project && (
        <ProjectView key={project.id} project={project} onClose={() => show(null)} onProject={id => show({ kind: 'project', id })} />
      )}
    </main>
  )
}

const host = (url: string) => url.replace(/^https?:\/\//, '').replace(/\/$/, '')

function CaseView({ study, onClose, onCase }: { study: Case; onClose: () => void; onCase: (id: string) => void }) {
  const n = cases.indexOf(study) + 1
  const next = cases[n % cases.length]
  const wide = study.visual !== 'sdk'
  return (
    <View
      next={{ title: next.title, go: () => onCase(next.id) }}
      label={study.title}
      onClose={onClose}
      bar={
        <>
          <p className="col-span-9 md:col-span-3">
            <span className="text-muted tabular-nums">{String(n).padStart(2, '0')}</span>{' '}
            <span className="font-semibold">{study.short}</span>
          </p>
          <p className="text-muted max-md:hidden md:col-span-5">A closer look · Coinme</p>
        </>
      }
    >
      <article className="grid-12 mt-8 gap-y-8">
        <div className="col-span-12 md:col-span-3">
          <h2 className="max-w-[28ch] font-semibold">{study.title}</h2>
          <p className="text-muted">{study.kind}</p>
        </div>
        <div className="col-span-12 md:col-[4/span_5]">
          <p className="statement">{study.summary}</p>
          {study.link && (
            <a className="link mt-4 block w-fit" href={study.link.url} target="_blank" rel="noreferrer">
              {study.link.label} ↗
            </a>
          )}
        </div>
        {wide && (
          <div className="col-span-12 mt-6 md:col-[4/span_9]">
            <Exhibit kind={study.visual} />
          </div>
        )}
        <div className="col-span-12 md:col-[4/span_5]">
          <div className="space-y-6">
            {study.sections.map(s => (
              <div key={s.title}>
                <h3 className="label">{s.title}</h3>
                <ul className="mt-1">
                  {s.items.map(item => (
                    <li key={item} className="rule-top py-2">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        {!wide && (
          <div className="col-span-12 md:col-[9/span_4] md:pl-[var(--gap)]">
            <Exhibit kind={study.visual} />
          </div>
        )}
      </article>
    </View>
  )
}

function ProjectView({ project, onClose, onProject }: { project: Project; onClose: () => void; onProject: (id: string) => void }) {
  const next = projects[(projects.indexOf(project) + 1) % projects.length]
  return (
    <View
      next={{ title: next.title, go: () => onProject(next.id) }}
      label={project.title}
      onClose={onClose}
      bar={
        <>
          <p className="col-span-9 font-semibold md:col-span-3">{project.title}</p>
          <p className="text-muted max-md:hidden md:col-span-4">{project.kind}</p>
          <p className="max-md:hidden md:col-span-4">
            {project.url && (
              <a className="link" href={project.url} target="_blank" rel="noreferrer">
                Visit the site ↗
              </a>
            )}
          </p>
        </>
      }
    >
      <article className="grid-12 mt-8 gap-y-8">
        <aside className="col-span-12 md:sticky md:top-[64px] md:col-span-3 md:self-start">
          <p>{project.summary}</p>
          <dl className="mt-6">
            {[...project.facts, ['Year', project.year] as [string, string]].map(([k, v]) => (
              <div key={k} className="rule-top py-1.5">
                <dt className="label">{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
          <ol className="mt-6">
            {project.details.map((d, k) => (
              <li key={d} className="grid grid-cols-[1.75rem_1fr] rule-top py-1.5">
                <span className="label tabular-nums">{String(k + 1).padStart(2, '0')}</span>
                <span>{d}</span>
              </li>
            ))}
          </ol>
          <p className="mt-6">
            {project.url ? (
              <a className="link font-semibold" href={project.url} target="_blank" rel="noreferrer">
                Visit {host(project.url)} ↗
              </a>
            ) : (
              project.note && <span className="text-muted">{project.note}</span>
            )}
          </p>
        </aside>
        <div className="col-span-12 grid gap-[var(--gap)] md:col-[4/span_9] md:grid-cols-2">
          {[project.hero, ...project.wide, ...project.cells].map((m, i) => (
            <figure key={m.name} className={i === 0 ? 'md:col-span-2' : ''}>
              <video
                src={m.src}
                poster={m.poster}
                muted
                loop
                playsInline
                autoPlay
                preload={i < 3 ? 'auto' : 'metadata'}
                className="aspect-[16/10] w-full bg-mist object-cover"
              />
            </figure>
          ))}
        </div>
      </article>
    </View>
  )
}

type Job = (typeof experience)[number]

function Job({ job, first, onCase }: { job: Job; first: boolean; onCase: (id: string) => void }) {
  const [open, setOpen] = useState(false)
  return (
    <article className={first ? '' : 'rule-top mt-6 pt-1.5'}>
      <div className="grid grid-cols-9 gap-x-[var(--gap)]">
        <h3 className="col-span-5 font-semibold md:col-span-3">
          {job.links.map(l =>
            l.label === job.company ? (
              <a key={l.url} className="link" href={l.url} target="_blank" rel="noreferrer">
                {job.company} ↗
              </a>
            ) : (
              <span key={l.url}>
                {job.company} <span className="font-normal text-muted">→</span>{' '}
                <a className="link" href={l.url} target="_blank" rel="noreferrer">
                  {l.label} ↗
                </a>
              </span>
            ),
          )}
        </h3>
        <p className="col-span-4 text-right tabular-nums md:order-last md:col-span-2">{job.dates}</p>
        <p className="col-span-9 md:col-span-4">
          {job.role} <span className="text-muted">· {job.note}</span>
        </p>
      </div>
      <div className="grid grid-cols-9 gap-x-[var(--gap)]">
        <p className="col-span-9 mt-3 max-w-[62ch] text-muted md:col-[4/span_6]">{job.context}</p>
        {job.groups.some(g => g.case) && (
          <p className="col-span-9 mt-3 flex flex-wrap gap-x-4 gap-y-1 md:col-[4/span_6]">
            <span className="text-muted">A closer look</span>
            {job.groups.flatMap(g => {
              const c = cases.find(c => c.id === g.case)
              return c ? [c] : []
            }).map(c => (
              <button key={c.id} className="link" onClick={() => onCase(c.id)}>
                {c.short} ↗
              </button>
            ))}
          </p>
        )}
        <button
          className="link col-span-9 mt-3 w-fit md:col-[4/span_6]"
          aria-expanded={open}
          onClick={() => setOpen(o => !o)}
        >
          {open ? '− Less' : '+ What I did'}
        </button>
        {open && (
          <div className="col-span-9 mt-4 grid gap-x-[var(--gap)] gap-y-5 md:col-[4/span_6] md:grid-cols-2">
            {job.groups.map(g => (
              <div key={g.title}>
                <h4 className="label">
                  {g.title}
                  {g.case && (
                    <button className="link ml-2 text-ink" onClick={() => onCase(g.case!)}>
                      A closer look ↗
                    </button>
                  )}
                </h4>
                <ul className="mt-1.5 space-y-1.5">
                  {g.items.map(item => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </article>
  )
}

/** One still per project, labelled before you look at it; its recording only plays while you hover */
function Still({ project, onOpen }: { project: Project; onOpen: () => void }) {
  const video = useRef<HTMLVideoElement>(null)
  // every frame opens the project's sheet: more recordings and the way to the live site
  return (
    <button
      onClick={onOpen}
      className="still col-span-12 block text-left md:col-span-4"
      onMouseEnter={() => video.current?.play().catch(() => {})}
      onMouseLeave={() => {
        if (!video.current) return
        video.current.pause()
        video.current.currentTime = 0
      }}
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-mist">
        <img src={project.hero.poster} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <video
          ref={video}
          src={project.hero.src}
          muted
          loop
          playsInline
          preload="none"
          className="still-video absolute inset-0 h-full w-full object-cover"
        />
      </div>
      <div className="mt-2 flex justify-between gap-4">
        <p className="font-semibold">
          {project.title}
          <span className="font-normal"> +</span>
        </p>
        <p className="tabular-nums">{project.year}</p>
      </div>
      <p className="text-muted">{project.kind}</p>
      <p className="mt-2 max-w-[48ch]">{firstSentence(project.summary)}</p>
    </button>
  )
}

const firstSentence = (s: string) => s.match(/^.*?[.!?](\s|$)/)?.[0].trim() ?? s

function Clock() {
  const [now, setNow] = useState(() => time())
  useEffect(() => {
    const t = setInterval(() => setNow(time()), 15000)
    return () => clearInterval(t)
  }, [])
  return <p className="tabular-nums">{now}</p>
}

const time = () =>
  new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Zagreb', hour: '2-digit', minute: '2-digit' }).format(new Date())
