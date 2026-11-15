import { useEffect, useRef, type ReactNode } from 'react'
import { cases, projects, type Case, type Media, type Project } from '@/data/site'
import CaseFilm from '@/components/films/CaseFilm'
import { FilmLook, LEAD } from '@/components/films/Film'
import { getLenis, smoothBox } from '@/lib/kit/lenis'
import { gsap, prefersReducedMotion } from '@/lib/kit/gsap'
import { useSwipeClose, view } from '@/lib/close-gestures'
import { pad } from '@/versions/parts'
import { playable } from '@/lib/video'

/** Clean's full-screen page for a case or a side project: the same paper, bar and type as the home page */
function View({
  label,
  crumb,
  onClose,
  next,
  children,
}: {
  label: string
  crumb: ReactNode
  onClose: () => void
  next: { label: string; title: string; go: () => void }
  children: ReactNode
}) {
  const root = useRef<HTMLDivElement>(null)
  const scroller = useRef<HTMLDivElement>(null)
  const content = useRef<HTMLDivElement>(null)
  const leaving = useRef(false)
  const mounted = useRef(false)
  const close = useRef(() => {})
  close.current = () => {
    if (leaving.current) return
    leaving.current = true
    if (prefersReducedMotion()) return onClose()
    gsap.to(root.current, { opacity: 0, y: 12, duration: 0.25, ease: 'power2.in', onComplete: onClose })
    // a hidden tab gets no animation frames, so the fade may never finish: close anyway
    setTimeout(() => mounted.current && onClose(), 400)
  }
  useSwipeClose(root, onClose, scroller)
  useEffect(() => {
    getLenis()?.stop()
    mounted.current = true
    // plain opacity, not autoAlpha: a hidden element can't take focus, and the keys should scroll this view at once
    scroller.current?.focus({ preventScroll: true })
    // one view replacing another keeps the paper up and brings only the words in, so the home page never shows between
    // (set by every open, so it's never stale here, and read-only so Strict Mode's second run sees the same)
    if (!prefersReducedMotion()) {
      if (view.swap) gsap.fromTo(content.current, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.5, ease: 'expo.out' })
      else gsap.fromTo(root.current, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.5, ease: 'expo.out' })
    }
    const smooth = smoothBox(scroller.current!, content.current!)
    const closing = () => close.current()
    view.close = closing
    const key = (e: KeyboardEvent) => e.key === 'Escape' && close.current()
    window.addEventListener('keydown', key)
    return () => {
      window.removeEventListener('keydown', key)
      if (view.close === closing) view.close = null
      smooth()
      gsap.killTweensOf([root.current, content.current])
      getLenis()?.start()
      mounted.current = false
    }
  }, [])
  return (
    <div ref={root} role="dialog" aria-modal="true" aria-label={label} data-lenis-prevent className="clean-view fixed inset-0 z-[70] bg-paper">
      <div ref={scroller} tabIndex={-1} className="absolute inset-0 overflow-y-auto overscroll-y-contain outline-none">
        <div ref={content}>
          <header className="sticky top-0 z-10 bg-paper/90 backdrop-blur">
            <div className="grid-12 items-center py-3.5">
              <div className="cap col-span-9">{crumb}</div>
              <button className="cap link col-span-3 justify-self-end" onClick={() => close.current()}>
                Close <span className="c-dim max-md:hidden">(Esc)</span>
              </button>
            </div>
          </header>
          {children}
          <button onClick={next.go} className="c-row grid-12 mt-24 w-full border-t border-(--color-rule) pt-3 pb-20 text-left" data-cursor="Next">
            <span className="cap col-span-12 md:col-span-4">↓ {next.label}</span>
            <span className="c-big c-slide col-span-12 mt-4 md:col-span-8 md:mt-0">{next.title}</span>
          </button>
        </div>
      </div>
    </div>
  )
}

/** The opening of a case or project: title, summary, and its facts in mono rows */
function Opening({ title, summary, facts, link }: { title: string; summary: string; facts: [string, string][]; link?: ReactNode }) {
  return (
    <section className="grid-12 gap-y-10 pt-16 pb-14 md:pt-24">
      <h2 className="c-big col-span-12 md:col-span-10">{title}</h2>
      <p className="c-lead col-span-12 md:col-span-7">{summary}</p>
      <dl className="col-span-12 md:col-span-4 md:col-start-9">
        {facts.map(([k, v]) => (
          <div key={k} className="cap grid grid-cols-3 gap-x-3 border-t border-(--color-rule) py-2">
            <dt className="c-dim">{k}</dt>
            <dd className="col-span-2">{v}</dd>
          </div>
        ))}
        {link && <div className="cap border-t border-(--color-rule) pt-2">{link}</div>}
      </dl>
    </section>
  )
}

/** A titled block of points, numbered like the home page */
function Block({ n, title, items }: { n: number; title: string; items: string[] }) {
  return (
    <section className="grid-12 gap-y-4 pb-10">
      <div className="col-span-12 grid grid-cols-subgrid border-t border-(--color-rule) pt-3">
        <h3 className="cap col-span-12 md:col-span-4">
          <span className="c-dim">{pad(n)}. </span>
          {title}
        </h3>
        <ul className="c-body c-points col-span-12 mt-4 md:col-span-7 md:col-start-6 md:mt-0">
          {items.map(item => (
            <li key={item} className="py-2.5 first:pt-0">
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export function CleanCase({ study, onClose, onCase }: { study: Case; onClose: () => void; onCase: (id: string) => void }) {
  const n = cases.indexOf(study) + 1
  const next = cases[n % cases.length]
  const [role, years] = study.kind.split(' · ')
  return (
    <View
      label={study.title}
      onClose={onClose}
      next={{ label: 'Next case', title: next.short, go: () => onCase(next.id) }}
      crumb={
        <>
          Coinme / <span className="c-dim">{pad(n)}.</span> {study.short}
        </>
      }
    >
      <Opening
        title={study.title}
        summary={study.summary}
        facts={[
          ['Role', role],
          ['Years', years ?? ''],
          ['Problem', study.problem],
          ['Result', study.result],
        ]}
        link={
          study.link && (
            <a className="link" href={study.link.url} target="_blank" rel="noreferrer">
              ↗ {study.link.label}
            </a>
          )
        }
      />
      {study.stats && (
        <dl className="grid-12 gap-y-8 pb-16">
          {study.stats.map(([k, v]) => (
            <div key={v} className="col-span-12 border-t border-(--color-rule) pt-3 md:col-span-4">
              <dt className="c-big">{k}</dt>
              <dd className="cap c-dim mt-3">{v}</dd>
            </div>
          ))}
        </dl>
      )}
      {study.visual && (
        <div className="grid-12 pb-16">
          <div className="col-span-12 md:col-span-8 md:col-start-3">
            {/* the thermal look: heat-map lights, pill places, lime labels and the specimen frame */}
            <FilmLook.Provider value={{ look: 'thermal', n, name: study.short, lead: LEAD[study.visual] }}>
              <CaseFilm kind={study.visual} />
            </FilmLook.Provider>
          </div>
        </div>
      )}
      {study.sections.map((s, i) => (
        <Block key={s.title} n={i + 1} title={s.title} items={s.items} />
      ))}
    </View>
  )
}

export function CleanProject({ project, onClose, onProject }: { project: Project; onClose: () => void; onProject: (id: string) => void }) {
  const i = projects.indexOf(project)
  const next = projects[(i + 1) % projects.length]
  const host = project.url?.replace(/^https?:\/\//, '').replace(/\/$/, '')
  return (
    <View
      label={project.title}
      onClose={onClose}
      next={{ label: 'Next project', title: next.title, go: () => onProject(next.id) }}
      crumb={
        <>
          On the side / <span className="c-dim">{pad(i + 1)}.</span> {project.title}
        </>
      }
    >
      <Opening
        title={project.title}
        summary={project.summary}
        facts={[['Kind', project.kind], ['Year', project.year], ...project.facts]}
        link={
          project.url ? (
            <a className="link" href={project.url} target="_blank" rel="noreferrer">
              ↗ {host}
            </a>
          ) : (
            project.note
          )
        }
      />
      <div className="grid-12 pb-16">
        <div className="col-span-12">
          <Film media={project.hero} eager />
        </div>
      </div>
      <Block n={1} title="How it works" items={project.details} />
      {[...project.wide, ...project.cells].length > 0 && (
        <section className="grid-12 gap-y-[var(--gap)] pt-6">
          {[...project.wide, ...project.cells].map(m => (
            <div key={m.name} className="col-span-12 md:col-span-6">
              <Film media={m} />
              <p className="cap c-dim mt-2">{m.name}</p>
            </div>
          ))}
        </section>
      )}
    </View>
  )
}

/** A recording that plays while on screen */
function Film({ media, eager = false }: { media: Media; eager?: boolean }) {
  if (media.still) return <img src={media.src} alt="" className="w-full max-w-[800px] border border-(--color-rule) bg-mist" />
  return <Recording media={media} eager={eager} />
}

function Recording({ media, eager }: { media: Media; eager: boolean }) {
  const video = useRef<HTMLVideoElement>(null)
  useEffect(() => {
    const v = video.current!
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !prefersReducedMotion()) v.play().catch(() => {})
        else v.pause()
      },
      { threshold: 0.2 },
    )
    io.observe(v)
    return () => io.disconnect()
  }, [])
  return (
    <video
      ref={video}
      src={playable(media)}
      poster={media.poster}
      muted
      loop
      playsInline
      preload={eager ? 'auto' : 'none'}
      className="aspect-[16/10] w-full bg-mist object-cover"
    />
  )
}
