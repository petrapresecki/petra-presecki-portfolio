import { useEffect, useRef, useState, type ReactNode } from 'react'
import { gsap, useGSAP, prefersReducedMotion } from '@/lib/kit/gsap'
import RollText from '@/components/kit/roll-text/RollText'
import { about, experience, person, projects, skills } from '@/data/site'
import { go } from '@/lib/route'
import { GridLines, LiveFrame, Media } from './Parts'

const host = (url: string) => url.replace(/^https?:\/\//, '').replace(/\/$/, '')

/** A fullscreen view with its own scroll, the grid behind it and a title bar. Esc goes home. */
function Panel({ bar, children, label }: { bar: ReactNode; children: ReactNode; label: string }) {
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const key = (e: KeyboardEvent) => e.key === 'Escape' && go({ page: 'home' })
    window.addEventListener('keydown', key)
    return () => window.removeEventListener('keydown', key)
  }, [])

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      gsap.from('.pn-in', { y: 18, autoAlpha: 0, duration: 1, ease: 'expo.out', stagger: 0.05, delay: 0.15 })
    },
    { scope: root },
  )

  return (
    <div ref={root} role="dialog" aria-modal="true" aria-label={label} data-lenis-prevent className="fixed inset-0 z-[70] overflow-y-auto overscroll-contain bg-paper">
      <div className="relative min-h-full pb-24">
        <GridLines />
        <div className="label cols sticky top-0 z-20 border-b border-rule bg-paper/92 py-2.5 backdrop-blur-sm">{bar}</div>
        <div className="relative z-10">{children}</div>
      </div>
    </div>
  )
}

function Close() {
  return (
    <button onClick={() => go({ page: 'home' })} className="group inline-flex justify-self-end uppercase hover:text-accent">
      <RollText text="Close ×" />
      <span className="ml-2 text-muted max-md:hidden">Esc</span>
    </button>
  )
}

export function ProjectPanel({ id }: { id: string }) {
  const i = projects.findIndex(p => p.id === id)
  const p = projects[i]
  const next = projects[(i + 1) % projects.length]
  const [live, setLive] = useState(false)

  return (
    <>
    <Panel
      label={p.title}
      bar={
        <>
          <span className="flex items-center gap-1.5">
            <span className="text-muted">{String(i + 1).padStart(2, '0')}</span>
            <span className="size-[7px] bg-accent" />
            <span className="font-medium">{p.title}</span>
          </span>
          <span className="text-muted max-md:hidden">{p.kind}</span>
          <span className="max-md:hidden">
            {p.url && (
              <button onClick={() => setLive(true)} className="group inline-flex uppercase hover:text-accent">
                <RollText text="Open live ↗" />
              </button>
            )}
          </span>
          <Close />
        </>
      }
    >
      <div className="cols mt-4 gap-y-8">
        {/* left: what it is */}
        <aside className="pn-in text-[13px] leading-[1.5] max-md:col-span-2 md:sticky md:top-[52px] md:self-start">
          <p className="text-[15px] leading-[1.45]">{p.summary}</p>
          <dl className="mt-6">
            {[...p.facts, ['Year', p.year] as [string, string]].map(([k, v]) => (
              <div key={k} className="mb-2">
                <dt className="label text-muted">{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
          <ol className="mt-6 border-t border-rule">
            {p.details.map((d, k) => (
              <li key={d} className="grid grid-cols-[1.75rem_1fr] border-b border-rule py-2">
                <span className="label text-muted">{String(k + 1).padStart(2, '0')}</span>
                <span>{d}</span>
              </li>
            ))}
          </ol>
          <div className="label mt-6 flex flex-col gap-1">
            {p.url ? (
              <>
                <button onClick={() => setLive(true)} className="w-fit bg-accent px-2 py-1.5 text-paper uppercase hover:bg-ink">
                  Open the live site here ↗
                </button>
                <a href={p.url} target="_blank" rel="noreferrer" className="group inline-flex w-fit hover:text-accent">
                  <RollText text={`${host(p.url)} ↗`} />
                </a>
              </>
            ) : (
              <span className="text-muted">{p.note}</span>
            )}
          </div>
        </aside>

        {/* right: the recording, then every cell at full width */}
        <div className="col-span-3 flex flex-col gap-[10px] max-md:col-span-2">
          <Media media={p.hero} className="pn-in aspect-[16/10]" reveal={false} />
          {[...p.wide, ...p.cells].map(c => (
            <Media key={c.name} media={c} className="aspect-[16/10]" />
          ))}
          <button onClick={() => go({ page: 'project', id: next.id })} className="group label mt-6 flex items-center justify-between border-t border-rule pt-2 text-left uppercase">
            <span className="text-muted">Next</span>
            <span className="flex items-center gap-1.5">
              <span className="size-[7px] bg-accent" />
              <RollText text={`${next.title} →`} />
            </span>
          </button>
        </div>
      </div>
    </Panel>
    {/* outside the panel, so it stacks above the panel's own title bar */}
    {live && p.url && <LiveFrame title={p.title} url={p.url} onClose={() => setLive(false)} />}
    </>
  )
}

export function ExperiencePanel() {
  return (
    <Panel
      label="Experience"
      bar={
        <>
          <span className="flex items-center gap-1.5">
            <span className="size-[7px] bg-accent" />
            <span className="font-medium">Experience</span>
          </span>
          <span className="text-muted max-md:hidden">CV — {person.name}</span>
          <span className="flex gap-4 max-md:hidden">
            <a href={person.cv} download className="group inline-flex hover:text-accent">
              <RollText text="Download PDF ↓" />
            </a>
          </span>
          <Close />
        </>
      }
    >
      {experience.map(job => (
        <section key={job.company} className="cols mt-4 gap-y-6 border-b border-rule pb-10 text-[13px] leading-[1.5]">
          <div className="pn-in max-md:col-span-2">
            <h2 className="text-[15px] font-medium">
              {job.company} <span className="font-normal text-muted">({job.note})</span>
            </h2>
            <p>{job.role}</p>
            <p className="label mt-1 text-muted">{job.dates}</p>
          </div>
          <p className="pn-in max-md:col-span-2">{job.context}</p>
          <div className="col-span-2 grid grid-cols-2 gap-x-[10px] gap-y-6 max-md:grid-cols-1">
            {job.groups.map(g => (
              <div key={g.title} className="pn-in">
                <h3 className="label text-muted">{g.title}</h3>
                <ul className="mt-1">
                  {g.items.map(it => (
                    <li key={it} className="border-t border-rule py-2">
                      {it}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      ))}

      <section className="cols mt-4 gap-y-4 border-b border-rule pb-10 text-[13px] leading-[1.5]">
        <h2 className="pn-in text-[15px] font-medium max-md:col-span-2">Skills</h2>
        <dl className="col-span-3 max-md:col-span-2">
          {skills.map(([k, v]) => (
            <div key={k} className="pn-in grid grid-cols-3 gap-x-[10px] border-t border-rule py-2 max-md:grid-cols-1">
              <dt className="label pt-px text-muted">{k}</dt>
              <dd className="col-span-2 max-md:col-span-1">{v}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="cols mt-4 gap-y-4 text-[13px] leading-[1.5]">
        <h2 className="pn-in text-[15px] font-medium max-md:col-span-2">Education</h2>
        <p className="pn-in max-md:col-span-2">
          BSc Computer Science
          <br />
          Faculty of Electrical Engineering and Computing (FER), University of Zagreb
          <span className="label mt-1 block text-muted">2018 — 2021</span>
        </p>
        <p className="pn-in max-md:col-span-2">
          English — fluent
          <br />
          Croatian — native
        </p>
        <a href={person.cv} download className="pn-in label w-fit justify-self-end bg-accent px-2 py-1.5 text-paper hover:bg-ink max-md:justify-self-start">
          Download PDF ↓
        </a>
      </section>
    </Panel>
  )
}

export function AboutPanel() {
  return (
    <Panel
      label="About"
      bar={
        <>
          <span className="flex items-center gap-1.5">
            <span className="size-[7px] bg-accent" />
            <span className="font-medium">About</span>
          </span>
          <span className="text-muted max-md:hidden">{person.role}</span>
          <span className="max-md:hidden" />
          <Close />
        </>
      }
    >
      <div className="cols mt-4 gap-y-10">
        <dl className="pn-in text-[13px] leading-[1.5] max-md:order-2 max-md:col-span-2">
          {about.facts.map(([k, v]) => (
            <div key={k} className="mb-2">
              <dt className="label text-muted">{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
        <div className="col-span-2 flex flex-col gap-5 bg-paper text-[clamp(18px,1.6vw,24px)] leading-[1.35] tracking-[-0.015em]">
          {about.lines.map(l => (
            <p key={l} className="pn-in">
              {l}
            </p>
          ))}
        </div>
        <div className="pn-in label flex flex-col items-end gap-1 max-md:order-3 max-md:col-span-2 max-md:items-start">
          <a href={`mailto:${person.email}`} className="group inline-flex normal-case hover:text-accent">
            <RollText text={person.email} />
          </a>
          <a href={person.linkedin} target="_blank" rel="noreferrer" className="group inline-flex hover:text-accent">
            <RollText text="LinkedIn ↗" />
          </a>
          <button onClick={() => go({ page: 'experience' })} className="group inline-flex uppercase hover:text-accent">
            <RollText text="Experience ↗" />
          </button>
        </div>
      </div>
      <div className="cols mt-24 text-[13px] leading-[1.5]">
        <p className="label pn-in text-muted">This site</p>
        <p className="pn-in col-span-2 bg-paper text-muted max-md:col-span-1">{about.colophon}</p>
      </div>
    </Panel>
  )
}
