import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { about, cases, experience, person, projects, skills } from '@/data/site'
import { ARROW, Clock, Intro } from '@/components/Page'
import { GRID_CV } from '@/components/CvPaper'
import { Clip, go, jobCases, pad, useOverlays } from '@/versions/parts'
import GridCase from '@/versions/GridCase'
import GridProject from '@/versions/GridProject'
import CutType from '@/components/kit/cut-type/CutType'
import CaseFilm from '@/components/films/CaseFilm'
import { prefersReducedMotion } from '@/lib/kit/gsap'

/**
 * After abgd.it, without its cards: a fixed bar of tiny capitals, a huge grotesk wordmark, a page index,
 * dense small paragraphs with indented follow-ons, list rows with a black tag bar on the right edge,
 * numbered index rows with black labels, and the wordmark again at the bottom.
 */
const INDEX = [
  ['experience', 'Experience'],
  ['about', 'About'],
  ['capabilities', 'Capabilities'],
  ['work', 'Side work'],
  ['contact', 'Contact'],
] as const

export default function Grid() {
  const { openCv, openCase, openProject, overlays } = useOverlays(GridCase, GridProject)
  const light = useLightGuide()
  return (
    <main className="grid-v">
      {/* the one light on the page, the same the case films are made of: four soft discs, each on its own loop. It sits
          behind whatever matters where you're reading (the [data-light] elements) and behind a row you point at */}
      <div className="page-light" aria-hidden>
        <div ref={light}>
          <i />
          <i />
          <i />
          <i />
        </div>
      </div>
      <header className="grid-bar">
        <div className="grid-12 items-center py-2.5">
          <a href="#top" className="cap col-span-6 md:col-span-3" onClick={e => go(e, 'top')}>
            {person.name}
          </a>
          <p className="cap hidden md:col-span-3 md:block">/01 Frontend engineer</p>
          <div className="cap col-span-6 flex items-center justify-end gap-2">
            Zagreb <Clock /> <span className="dot" />
          </div>
        </div>
      </header>

      {/* the first screen: everything down to the foot line, so the experience starts below the fold */}
      <div className="hero">
        <section id="top" className="grid-12 pt-14">
          <CutType as="h1" text="Hi, I’m Petra" reveal className="wordmark hello hello-cut col-span-12 md:col-span-10" />
          <nav className="hidden md:col-span-2 md:mt-3 md:block" aria-label="Index">
            {INDEX.map(([id, label], i) => (
              <a key={id} href={`#${id}`} className="cap index-row" onClick={e => go(e, id)}>
                <span>{label}</span>
                <span>P.{pad(i + 1)}</span>
              </a>
            ))}
          </nav>
        </section>

        {/* as on abgd.it: the copy set line on line from the second third to the edge, the follow-on stepped in twice; even space above and below */}
        <section className="hero-intro grid-12 flex-1 pb-8">
          <div data-light className="intro-ab col-span-12 row-start-2 md:col-[1/span_10] lg:col-[5/span_8]">
            <p className="lead-l">
              <Intro greeting={false} />
            </p>
            <p className="lead-l indent">{about.lines[1]}</p>
            <p data-light className="cap mt-8 flex flex-wrap gap-x-4 gap-y-1">
              <a href={`mailto:${person.email}`} className="link">↗︎ Email</a>
              <a href={GRID_CV} target="_blank" rel="noreferrer" className="link" onClick={openCv}>↗︎ CV</a>
              <a href={person.linkedin} target="_blank" rel="noreferrer" className="link">↗︎ LinkedIn</a>
              <a href={person.github} target="_blank" rel="noreferrer" className="link">↗︎ GitHub</a>
            </p>
          </div>
          <p className="hero-foot title-l col-span-6 row-start-4 md:col-span-4">2021–2026</p>
          <a
            data-light
            href="#experience"
            className="hero-foot title-l col-span-6 row-start-4 text-right md:col-[5/span_4] md:text-left"
            onClick={e => go(e, 'experience')}
          >
            Experience ↘︎
          </a>
        </section>
      </div>

      <Star />

      <section id="experience">
        {experience.map(job => (
          <Job key={job.company} job={job} onCase={openCase} />
        ))}
      </section>

      <Star />

      {/* the Coinme cases, set like the side work but barer: a number, the name, the film */}
      <section id="cases">
        <p className="grid-12 cap pb-2">
          <span data-light className="col-span-12 md:col-[4/span_6]">
            / A closer look /
          </span>
        </p>
        {cases.map((c, i) => (
          <CaseRow key={c.id} n={i + 1} study={c} onOpen={() => openCase(c.id)} />
        ))}
      </section>

      <Star />

      {/* built like an experience row: the label where the years go, the words in the middle, the facts where the tag sits */}
      <section id="about" className="list-row">
        <p className="cap col-span-12 md:col-span-3">/ About /</p>
        <div className="col-span-12 mt-3 md:col-span-6 md:mt-0">
          <p data-light className="lead-l max-w-[30em]">
            {about.lines[0]}
          </p>
          <div className="dense about-body mt-6 max-w-[34em]">
            <p>{about.lines[2]}</p>
            <p className="indent">{about.lines[3]}</p>
          </div>
        </div>
        <dl className="col-span-12 mt-8 grid grid-cols-2 gap-x-[var(--gap)] md:col-span-3 md:mt-0 md:block">
          {about.facts.map(([k, v], i) => (
            <div key={k} className={`cap border-(--color-rule) py-1.5 ${i ? 'border-t' : 'max-md:border-t'}`}>
              <dt className="text-muted">{k}</dt>
              <dd className="mt-0.5">{v}</dd>
            </div>
          ))}
        </dl>
      </section>

      <Star />

      <section id="capabilities" className="grid-12">
        <h2 data-light className="title-l col-span-12 md:col-[4/span_9]">
          What I work with
        </h2>
        <div className="col-span-12 mt-8 md:col-[4/span_9]">
          {skills.map(([k, v], i) => (
            <div key={k} className="grid grid-cols-9 gap-x-[var(--gap)] rule-top py-3">
              <p className="col-span-9 md:col-span-3">
                <span data-light className="bar">
                  /{i + 1}.0 {k}
                </span>
              </p>
              <p className="dense-b col-span-9 mt-2 md:col-span-6 md:mt-0">{v}</p>
            </div>
          ))}
        </div>
      </section>

      <Star />

      <section id="work">
        <p className="grid-12 cap pb-2">
          <span data-light className="col-span-12 md:col-[4/span_6]">
            / Side work /
          </span>
        </p>
        {projects.map(p => (
          <SideRow key={p.id} project={p} onOpen={() => openProject(p.id)} />
        ))}
      </section>

      <Star />

      <section id="contact" className="grid-12 gap-y-12">
        {[
          {
            title: 'Collaborate',
            links: [
              ['Email me', `mailto:${person.email}`],
              ['LinkedIn', person.linkedin],
            ],
          },
          {
            title: 'Know more',
            links: [
              ['CV', GRID_CV],
              ['GitHub', person.github],
            ],
          },
        ].map((c, i) => (
          <div key={c.title} className={`col-span-12 md:col-span-4 ${i ? '' : 'md:col-start-3'}`}>
            <p data-light className="title-l">
              {c.title} ↘︎
            </p>
            <p className="cap mt-3 text-muted">/Contact me</p>
            <ul className="mt-10">
              {c.links.map(([label, href]) => (
                <li key={label} className="rule-bottom">
                  <a
                    href={href}
                    className="cap link block py-2"
                    target={href.startsWith('mailto') ? undefined : '_blank'}
                    rel="noreferrer"
                    onClick={href === GRID_CV ? openCv : undefined}
                  >
                    ↗︎ {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <Star />

      <footer className="pb-4">
        <div className="rule-top mx-[var(--margin)] pt-3">
          {/* the hello's cut again, so the page opens and closes the same way; pointing re-cuts it. No sweep in: the page ends before it would start */}
          <a data-light href={`mailto:${person.email}`} className="wordmark foot block" aria-label={`Email ${person.email}`}>
            <FitLine>
              <CutType as="span" text={person.email} seed={3} className="hello-cut" />
            </FitLine>
          </a>
        </div>
        <div className="grid-12 cap mt-3">
          <span className="col-span-12 md:col-span-9">{person.name} portfolio</span>
          <span className="col-span-12 md:col-span-3 md:text-right">Designed and built by me</span>
        </div>
      </footer>

      {overlays}
    </main>
  )
}

/** A side project: its film plays inline on phones while on screen, and in the right-hand column on desktop while you point at the row */
function SideRow({ project: p, onOpen }: { project: (typeof projects)[number]; onOpen: () => void }) {
  const [pointed, setPointed] = useState(false)
  return (
    <button
      className="group side-row list-row w-full text-left"
      onClick={onOpen}
      onMouseEnter={() => setPointed(true)}
      onMouseLeave={() => setPointed(false)}
    >
      <span className="cap col-span-6 md:col-span-3">{p.year}</span>
      <span className="order-last col-span-12 mt-2 md:order-none md:col-span-6 md:mt-0">
        {/* first names only: the row is a quick index, the project page has the rest */}
        <span className="title-m block">
          <span data-light="row" className="side-title">
            {p.title.split(' ')[0]}
          </span>
          <span className="side-arrow"> ↗︎</span>
        </span>
        <Clip project={p} play="view" className="mt-4 aspect-[16/10] md:hidden" />
      </span>
      <span className="hidden md:relative md:col-span-3 md:block">
        <Clip project={p} play={pointed} className="grid-peek aspect-[16/10] md:absolute md:inset-x-0 md:top-0 md:z-10" />
      </span>
    </button>
  )
}

/** A case: on desktop its film plays in the right-hand column while you point at the row; phones get the name only */
function CaseRow({ n, study, onOpen }: { n: number; study: (typeof cases)[number]; onOpen: () => void }) {
  const [pointed, setPointed] = useState(false)
  return (
    <button
      className="group side-row list-row w-full text-left"
      onClick={onOpen}
      onMouseEnter={() => setPointed(true)}
      onMouseLeave={() => setPointed(false)}
      onFocus={() => setPointed(true)}
      onBlur={() => setPointed(false)}
    >
      <span className="cap col-span-6 md:col-span-3">/{pad(n)}</span>
      <span className="order-last col-span-12 mt-2 md:order-none md:col-span-6 md:mt-0">
        <span className="title-m block">
          <span data-light="row" className="side-title">
            {study.short}
          </span>
          <span className="side-arrow"> ↗︎</span>
        </span>
      </span>
      <span className="hidden md:relative md:col-span-3 md:block">
        {study.visual && pointed && (
          <span className="case-peek pointer-events-none md:absolute md:inset-x-0 md:top-0 md:z-10 md:block">
            <CaseFilm kind={study.visual} play />
          </span>
        )}
      </span>
    </button>
  )
}

/** One line of type sized to fill the width it is given */
function FitLine({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLSpanElement>(null)
  useLayoutEffect(() => {
    const el = ref.current!
    // a few passes, since the cut letters don't grow quite in proportion
    const fit = () => {
      let size = 100
      for (let i = 0; i < 3; i++) {
        el.style.fontSize = `${size}px`
        size *= el.parentElement!.clientWidth / el.getBoundingClientRect().width
      }
      el.style.fontSize = `${Math.floor(size * 100) / 100}px`
    }
    fit()
    // the box, and the line itself when its face changes
    const ro = new ResizeObserver(fit)
    ro.observe(el.parentElement!)
    ro.observe(el)
    // the width changes again when the face arrives
    document.fonts.addEventListener('loadingdone', fit)
    return () => {
      ro.disconnect()
      document.fonts.removeEventListener('loadingdone', fit)
    }
  }, [])
  return (
    <span ref={ref} className="block tracking-[-0.035em] whitespace-nowrap" style={{ width: 'max-content' }}>
      {children}
    </span>
  )
}

/** the space between parts */
const Star = () => <div className="h-14 md:h-20" aria-hidden />

type Job = (typeof experience)[number]

function Job({ job, onCase }: { job: Job; onCase: (id: string) => void }) {
  const [open, setOpen] = useState(false)
  const to = job.links.find(l => l.label !== job.company)?.label
  return (
    <article>
      <div className="list-row">
        <span className="cap col-span-6 md:col-span-3">{job.dates}</span>
        <div className="order-last col-span-12 mt-2 md:order-none md:col-span-6 md:mt-0">
          <h3 data-light className="title-l">
            {job.company}
            {to && <span className="text-muted"> /{to}</span>}
          </h3>
          <p className="cap sub mt-2">
            / {job.role} · {job.note}
          </p>
          <p className="dense mt-5 max-w-[56ch]">{job.context}</p>
          {/* the cases have their own section below; here, one quiet pointer to it beside the toggle */}
          <p className="cap mt-4 flex flex-wrap gap-x-4 gap-y-1">
            <button className="link" aria-expanded={open} onClick={() => setOpen(o => !o)}>
              {open ? '− Less' : '+ What I did'}
            </button>
            {jobCases(job.groups).length > 0 && (
              <a href="#cases" className="link text-muted" onClick={e => go(e, 'cases')}>
                ↓ {jobCases(job.groups).length} case studies
              </a>
            )}
          </p>
        </div>
        <span className="col-span-6 md:col-span-3">
          <span className="tag">{job.company === 'Coinme' ? 'Product' : 'Agency work'}</span>
        </span>
      </div>
      {open && (
        <div className="grid-12 pb-8">
          <div className="col-span-12 md:col-[4/span_9]">
            {job.groups.map((g, i) => (
              <div key={g.title} className="grid grid-cols-9 gap-x-[var(--gap)] rule-top py-3">
                <div className="col-span-9 md:col-span-3">
                  <span className="bar">
                    /{i + 1}.0 {g.title}
                  </span>
                  {g.case && (
                    <button className="cap link mt-2 block" onClick={() => onCase(g.case!)}>
                      A closer look {ARROW}
                    </button>
                  )}
                </div>
                <ol className="dense-b col-span-9 mt-3 space-y-2 md:col-span-6 md:mt-0">
                  {g.items.map((item, k) => (
                    <li key={item} className="grid grid-cols-[3em_1fr]">
                      <span className="cap text-muted">
                        /{i + 1}.{k + 1}
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </div>
      )}
    </article>
  )
}

/**
 * The light marks what matters on the screen, one thing per disc. The parts worth marking carry [data-light]: the
 * intro and its links, each job, each case and side project, About, each capability, the contact titles and the email.
 * The big disc takes whichever is nearest the reading line, about two fifths down the screen (lower near the end, so
 * the email can have it), or the case or side project row you're pointing at. Each of the others takes another of the
 * nearest and keeps it while it stays on screen, so they cross to new marks one at a time as you scroll. A disc with
 * nothing left to mark roams its own slow path, and every disc moves with its own weight and top speed. Reduced motion
 * leaves them where they start.
 */
const DISCS = [
  // how long it takes to catch up (s), its top speed (px/s), and its path when it roams: how far across the screen it
  // goes (share of width and height) and how long a round takes (s)
  { lag: 0.5, speed: 900, roam: [0.06, 0.06], loop: 31 },
  { lag: 0.8, speed: 750, roam: [0.3, 0.22], loop: 26 },
  { lag: 0.6, speed: 650, roam: [0.42, 0.36], loop: 19 },
  { lag: 1, speed: 550, roam: [0.4, 0.4], loop: 41 },
]

function useLightGuide() {
  const light = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (prefersReducedMotion()) return
    const discs = [...light.current!.children] as HTMLElement[]
    let pointed: Element | null = null
    // what each disc is marking, its resting middle, and where it is now
    let marks: (Element | null)[] = discs.map(() => null)
    let homes: number[][] = []
    let shown: number[][] = []
    let last = 0
    let picked = 0
    let raf = 0
    const measure = () => {
      homes = discs.map(d => [d.offsetLeft + d.offsetWidth / 2, d.offsetTop + d.offsetHeight / 2])
    }
    // the spot behind an element: a little in from its start, level with its middle
    const spot = (e: Element) => {
      const r = e.getBoundingClientRect()
      return [r.left + Math.min(r.width * 0.3, 220), r.top + r.height / 2]
    }
    const pick = () => {
      const vh = window.innerHeight
      const room = document.documentElement.scrollHeight - vh
      const end = room > 0 ? Math.max(0, (window.scrollY - (room - vh)) / vh) : 0
      const line = vh * (0.42 + 0.4 * Math.min(1, end))
      // what's on screen, nearest the reading line first
      const seen = [...document.querySelectorAll('.grid-v [data-light]')]
        .map(e => [e, e.getBoundingClientRect()] as const)
        .filter(([, r]) => r.top + r.height / 2 > vh * 0.08 && r.top + r.height / 2 < vh * 0.92)
        .sort(([, a], [, b]) => Math.abs(a.top + a.height / 2 - line) - Math.abs(b.top + b.height / 2 - line))
        .map(([e]) => e)
      const first = pointed ?? seen[0] ?? null
      const rest = seen.filter(e => e !== first).slice(0, 6)
      const next: (Element | null)[] = [first]
      for (let i = 1; i < discs.length; i++) next.push(marks[i] && rest.includes(marks[i]!) && !next.includes(marks[i]) ? marks[i] : null)
      for (let i = 1; i < discs.length; i++) if (!next[i]) next[i] = rest.find(e => !next.includes(e)) ?? null
      marks = next
    }
    // where disc i wants to be: on its mark, breathing a little around it, or on its own path when it has none
    const goal = (i: number, now: number) => {
      const { roam, loop } = DISCS[i]
      const a = ((now / 1000) * Math.PI * 2) / loop
      const [w, h] = [window.innerWidth, window.innerHeight]
      const mark = marks[i]
      if (mark) {
        const [x, y] = spot(mark)
        return [x + Math.sin(a + i) * w * 0.02, y + Math.sin(a * 1.4 + i * 2) * h * 0.02]
      }
      return [w * (0.5 + roam[0] * Math.sin(a + i * 1.9)), h * (0.5 + roam[1] * Math.sin(a * (1.3 + i * 0.2) + i * 2.7))]
    }
    const tick = (now: number) => {
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60
      last = now
      // choosing marks reads the whole page, so ten times a second is plenty; the discs still move every frame
      if (now - picked > 100) {
        pick()
        picked = now
      }
      discs.forEach((d, i) => {
        const [gx, gy] = goal(i, now)
        const k = 1 - Math.exp(-dt / DISCS[i].lag)
        const dx = (gx - shown[i][0]) * k
        const dy = (gy - shown[i][1]) * k
        const len = Math.hypot(dx, dy)
        const cap = len > DISCS[i].speed * dt ? (DISCS[i].speed * dt) / len : 1
        shown[i] = [shown[i][0] + dx * cap, shown[i][1] + dy * cap]
        d.style.translate = `${(shown[i][0] - homes[i][0]).toFixed(1)}px ${(shown[i][1] - homes[i][1]).toFixed(1)}px`
      })
      raf = requestAnimationFrame(tick)
    }
    const over = (e: PointerEvent) => {
      const row = (e.target as Element).closest?.('.side-row')
      pointed = row?.querySelector('[data-light]') ?? null
    }
    const leave = () => (pointed = null)
    measure()
    pick()
    shown = discs.map((_, i) => goal(i, performance.now()))
    raf = requestAnimationFrame(tick)
    window.addEventListener('resize', measure)
    document.addEventListener('pointerover', over)
    document.documentElement.addEventListener('pointerleave', leave)
    return () => {
      window.removeEventListener('resize', measure)
      document.removeEventListener('pointerover', over)
      document.documentElement.removeEventListener('pointerleave', leave)
      cancelAnimationFrame(raf)
    }
  }, [])
  return light
}
