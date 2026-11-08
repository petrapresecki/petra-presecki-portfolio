import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { about, ask, cases, experience, person, projects, skills } from '@/data/site'
import { Clock, Intro } from '@/components/Page'
import { GRID_CV } from '@/components/CvPaper'
import { go, pad, useOverlays } from '@/versions/parts'
import { CleanCase, CleanProject } from '@/versions/CleanView'
import Cursor from '@/versions/Cursor'

const NAV = [
  ['experience', 'Experience'],
  ['cases', 'Cases'],
  ['work', 'Side work'],
  ['about', 'About'],
  ['contact', 'Contact'],
] as const

const PHOTO = '/me/petra.webp'

/**
 * After ksusharmony.com: off-white paper, a grotesk you can read and tiny mono capitals for everything that labels,
 * one small matte portrait in About, lots of air. With few pictures to show, the type does the work: a big opening sentence,
 * big numbered lists where pointing at one row quiets the others, and the email set as large as the page allows.
 */
export default function Clean() {
  const { openCv, openCase, openProject, overlays } = useOverlays(CleanCase, CleanProject)
  const current = useCurrentSection(NAV.map(([id]) => id))
  return (
    <main className="clean-v">
      <Cursor />

      <header className="c-bar">
        <div className="grid-12 items-start py-3.5">
          <a href="#top" className="c-mark col-span-7 md:col-span-3" onClick={e => go(e, 'top')}>
            {person.name}.
            <br />
            <span className="c-dim">{person.role}</span>
          </a>
          <nav className="cap col-span-6 hidden gap-x-5 md:flex" aria-label="Sections">
            {NAV.map(([id, label]) => (
              <a key={id} href={`#${id}`} aria-current={current === id} className="link" onClick={e => go(e, id)}>
                {label}
              </a>
            ))}
          </nav>
          <div className="cap col-span-5 flex justify-end gap-2 text-right md:col-span-3">
            <span className="c-dim max-md:hidden">Zagreb</span> <Clock />
          </div>
        </div>
      </header>

      {/* the first screen: the sentence, then along the bottom the email and the short version; the portrait waits for About */}
      <section id="top" className="flex min-h-[100svh] flex-col pt-28 pb-6 md:pt-36">
        <div className="grid-12">
          <p className="c-lead c-in col-span-12 md:col-span-10 lg:col-span-9">
            <Intro />
          </p>
        </div>

        <div className="grid-12 mt-auto items-end gap-y-8 pt-16">
          <div className="cap c-in col-span-12 md:col-span-4" style={{ '--i': 2 } as React.CSSProperties}>
            <a href={`mailto:${person.email}`} className="link">
              {person.email}
            </a>
          </div>
          <div className="cap c-in col-span-12 md:col-span-4 md:col-start-7" style={{ '--i': 3 } as React.CSSProperties}>
            <p>
              {person.focus}.
              <br />
              {person.stack}.
              <br />
              {person.place}.
            </p>
            <p className="mt-6 flex flex-wrap gap-x-4">
              <a href="#about" className="link" onClick={e => go(e, 'about')}>
                (More about…)
              </a>
              <a href={GRID_CV} className="link" onClick={openCv}>
                (CV ↗)
              </a>
            </p>
          </div>
        </div>
        <div className="grid-12 mt-10">
          <a href="#experience" className="cap col-span-12 w-fit" onClick={e => go(e, 'experience')}>
            ↓ Experience, 2021–2026
          </a>
        </div>
      </section>

      <Head n={1} id="experience" label="Experience" note="2021–2026" />
      {experience.map((job, i) => (
        <Job key={job.company} n={i + 1} job={job} onCase={openCase} />
      ))}

      <Head n={2} id="cases" label="Closer look" note={`${cases.length} case studies`} />
      <div className="c-list pb-8">
        {cases.map((c, i) => (
          <button key={c.id} className="c-row grid-12 w-full border-b border-(--color-rule) py-6 text-left md:py-8" data-cursor="Read" onClick={() => openCase(c.id)}>
            <span className="cap c-dim col-span-2 pt-2 md:col-span-1">{pad(i + 1)}.</span>
            <span className="col-span-10 md:col-span-6">
              <span className="c-title c-slide block">{c.short}</span>
              <span className="cap c-dim mt-3 block">{c.own}</span>
            </span>
            <span className="c-body col-span-10 col-start-3 mt-4 md:col-span-5 md:col-start-auto md:mt-1">
              {c.result}
            </span>
          </button>
        ))}
      </div>

      <Head n={3} id="work" label="On the side" note="Sites for creative people, and tools" />
      <div className="c-list pb-8">
        {projects.map((p, i) => (
          <button
            key={p.id}
            className="c-row grid-12 w-full border-b border-(--color-rule) py-4 text-left md:py-5"
            data-cursor="View"
            data-peek={p.hero.poster}
            onClick={() => openProject(p.id)}
          >
            <span className="cap c-dim col-span-2 pt-1.5 md:col-span-1">{pad(i + 1)}.</span>
            <span className="c-slide col-span-10 text-[clamp(22px,2.2vw,34px)] leading-[1.05] font-medium tracking-[-0.025em] md:col-span-7">{p.title}</span>
            <span className="cap col-span-10 col-start-3 mt-2 md:col-span-3 md:col-start-auto md:mt-1">
              {p.kind}
              <br />
              <span className="c-dim">{p.year}</span>
            </span>
            <span className="cap c-arrow col-span-1 hidden pt-2 text-right md:block">↗</span>
          </button>
        ))}
      </div>

      <Head n={4} id="about" label="About" note={person.place} />
      <section className="grid-12 gap-y-10 pt-8 pb-20">
        <img src={PHOTO} alt="Petra Presečki" className="c-portrait col-span-5 w-full md:col-span-2" />
        <div className="col-span-12 md:col-span-8 md:col-start-5">
          <p className="c-lead">{about.lines[0]}</p>
          <div className="c-body mt-10 grid gap-x-[var(--gap)] gap-y-5 md:grid-cols-2">
            {about.lines.slice(1).map(l => (
              <p key={l}>{l}</p>
            ))}
          </div>
          <dl className="mt-14 grid grid-cols-2 gap-x-[var(--gap)] md:grid-cols-4">
            {about.facts.map(([k, v]) => (
              <div key={k} className="cap border-t border-(--color-rule) pt-2 pb-4">
                <dt className="c-dim">{k}</dt>
                <dd className="mt-1">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <Head n={5} id="skills" label="What I work with" />
      <section className="grid-12 gap-y-10 pt-8 pb-24">
        {skills.map(([k, v], i) => (
          <div key={k} className="col-span-12 md:col-span-4">
            <p className="cap c-dim">{pad(i + 1)}.</p>
            <h3 className="mt-2 text-[22px] leading-tight font-medium tracking-[-0.015em]">{k}</h3>
            <p className="c-body mt-3">{v.split(', ').join(' · ')}</p>
          </div>
        ))}
      </section>

      <Head n={6} id="contact" label="Contact" note="Open to new work" />
      <section className="grid-12 pt-10">
        <p className="c-lead col-span-12 md:col-span-9">{ask}</p>
      </section>
      <div className="mt-14 px-(--margin)">
        <a href={`mailto:${person.email}`} className="block" data-cursor="Write">
          <FitLine>{person.email}</FitLine>
        </a>
      </div>

      {/* ksusharmony's bottom line: contacts, spread across */}
      <footer className="grid-12 mt-10 gap-y-3 border-t border-(--color-rule) pt-3 pb-6">
        <span className="cap col-span-12 md:col-span-3">Contacts:</span>
        <div className="cap col-span-12 flex flex-wrap gap-x-6 gap-y-1 md:col-span-6">
          <a className="link" href={`mailto:${person.email}`}>Email ↗</a>
          <a className="link" href={person.linkedin} target="_blank" rel="noreferrer">LinkedIn ↗</a>
          <a className="link" href={person.github} target="_blank" rel="noreferrer">GitHub ↗</a>
          <a className="link" href={GRID_CV} onClick={openCv}>CV ↗</a>
        </div>
        <span className="cap c-dim col-span-12 md:col-span-3 md:text-right">© {new Date().getFullYear()} · Designed & built by me</span>
      </footer>

      {overlays}
    </main>
  )
}

/** A section's opening line: hairline, number, name, and a note at the right */
function Head({ n, id, label, note }: { n: number; id: string; label: string; note?: string }) {
  return (
    <div id={id} className="grid-12 mt-16 scroll-mt-20 md:mt-24">
      <div className="c-head cap col-span-12 grid grid-cols-subgrid">
        <span className="col-span-2 md:col-span-1">({pad(n)})</span>
        <span className="col-span-10 md:col-span-6">↓ {label}</span>
        {note && <span className="c-dim col-span-12 max-md:col-start-3 md:col-span-5 md:text-right">{note}</span>}
      </div>
    </div>
  )
}

type JobT = (typeof experience)[number]

/** A job: the company big, what the work was in a readable paragraph, then each part of it as a numbered block */
function Job({ n, job, onCase }: { n: number; job: JobT; onCase: (id: string) => void }) {
  // Coinme is Polygon now: lead with the company, the product it was in brackets
  const heading = job.company === 'Coinme' ? ['Polygon', 'Coinme'] : [job.company, job.note]
  return (
    <article className="grid-12 gap-y-6 pt-10 pb-6 md:pt-14">
      <div className="cap col-span-12 md:col-span-3">
        <span className="c-dim">{pad(n)}. </span>
        {job.dates}
        <br />
        <span className="c-dim">{job.company === 'Coinme' ? 'Product' : 'Agency work'}</span>
      </div>
      <div className="col-span-12 md:col-span-9">
        <h3 className="c-title">
          {heading[0]}
          <span className="c-faint"> ({heading[1]})</span>
        </h3>
        <p className="cap mt-4">{job.role}</p>
        <p className="c-body mt-6 max-w-[60ch]">{job.context}</p>

        {/* what I did, folded: the areas read as a list, each opens to its points */}
        <div className="c-list mt-12 border-b border-(--color-rule)">
          {job.groups.map((g, i) => (
            <Group key={g.title} n={`${n}.${i + 1}`} group={g} onCase={onCase} />
          ))}
        </div>
      </div>
    </article>
  )
}

type GroupT = JobT['groups'][number]

/**
 * One area of a job, folded: the number and name as a row with a + at the right, so a job reads as a short list of
 * what it was about. Clicking opens the points under it (the height eases open); the case study link sits inside.
 */
function Group({ n, group: g, onCase }: { n: string; group: GroupT; onCase: (id: string) => void }) {
  const [open, setOpen] = useState(false)
  const id = `g-${n}`
  const study = 'case' in g ? g.case : undefined
  return (
    <section className="c-row border-t border-(--color-rule)">
      <button
        className="group grid w-full grid-cols-[3.5em_1fr_auto] items-baseline gap-x-3 py-4 text-left md:grid-cols-9 md:gap-x-[var(--gap)]"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen(o => !o)}
      >
        <span className="cap c-dim md:col-span-1">{n}</span>
        <span className="c-slide text-[19px] leading-snug font-medium tracking-[-0.01em] md:col-span-7 md:text-[21px]">{g.title}</span>
        <span className="cap c-dim text-right md:col-span-1">
          <span className="max-md:hidden">({g.items.length}) </span>
          <span className="inline-block w-[1ch] text-[14px] text-(--color-ink)">{open ? '−' : '+'}</span>
        </span>
      </button>
      <div id={id} className="c-fold" data-open={open} inert={!open}>
        <div className="overflow-hidden">
          <div className="grid gap-x-[var(--gap)] pb-8 md:grid-cols-9">
            <ul className="c-body c-points md:col-span-6 md:col-start-2">
              {g.items.map(item => (
                <li key={item} className="py-2.5 first:pt-0">
                  {item}
                </li>
              ))}
            </ul>
            {study && (
              <p className="mt-4 md:col-span-2 md:col-start-8 md:mt-0 md:text-right">
                <button className="cap link" onClick={() => onCase(study)}>
                  → Case study
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

/** One line of type sized to fill its box */
function FitLine({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLSpanElement>(null)
  useLayoutEffect(() => {
    const el = ref.current!
    const fit = () => {
      el.style.fontSize = '100px'
      const size = (100 * el.parentElement!.clientWidth) / el.getBoundingClientRect().width
      el.style.fontSize = `${Math.floor(size * 100) / 100}px`
    }
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(el.parentElement!)
    document.fonts.addEventListener('loadingdone', fit)
    return () => {
      ro.disconnect()
      document.fonts.removeEventListener('loadingdone', fit)
    }
  }, [])
  return (
    <span
      ref={ref}
      className="block leading-[0.9] font-medium tracking-[-0.05em] whitespace-nowrap"
      style={{ width: 'max-content' }}
    >
      {children}
    </span>
  )
}

/** Which section the reading line (a third down) is in */
function useCurrentSection(ids: readonly string[]) {
  const [current, setCurrent] = useState<string | null>(null)
  useEffect(() => {
    const check = () => {
      const line = window.innerHeight / 3
      let found: string | null = null
      for (const id of ids) {
        const el = document.getElementById(id)
        if (el && el.getBoundingClientRect().top <= line) found = id
      }
      setCurrent(found)
    }
    check()
    window.addEventListener('scroll', check, { passive: true })
    return () => window.removeEventListener('scroll', check)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return current
}
