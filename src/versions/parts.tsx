import { useEffect, useRef, useState } from 'react'
import { cases, projects, type Project } from '@/data/site'
import { CaseView, ProjectView } from '@/components/Page'
import CvPaper from '@/components/CvPaper'
import { getLenis } from '@/lib/kit/lenis'
import { prefersReducedMotion } from '@/lib/kit/gsap'
import { useBackCloses } from '@/lib/close-gestures'

export const go = (e: React.MouseEvent, id: string) => {
  e.preventDefault()
  getLenis()?.scrollTo(`#${id}`, { duration: 1.2 })
}

type Open = { kind: 'case'; id: string } | { kind: 'project'; id: string } | null

/** The case, project and CV views the original opens, for any version; a version can bring its own case and project views */
export function useOverlays(Case: typeof CaseView = CaseView, Project: typeof ProjectView = ProjectView) {
  const [open, setOpen] = useState<Open>(null)
  const [cv, setCv] = useState(false)
  const openCv = (e: React.MouseEvent) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    e.preventDefault()
    setCv(true)
  }
  useBackCloses(cv || !!open, () => {
    setOpen(null)
    setCv(false)
  })
  const openCase = (id: string) => setOpen({ kind: 'case', id })
  const openProject = (id: string) => setOpen({ kind: 'project', id })
  const study = open?.kind === 'case' ? cases.find(c => c.id === open.id) : undefined
  const project = open?.kind === 'project' ? projects.find(p => p.id === open.id) : undefined
  const overlays = (
    <>
      {cv && <CvPaper onClose={() => setCv(false)} />}
      {study && <Case key={study.id} study={study} onClose={() => setOpen(null)} onCase={openCase} />}
      {project && <Project key={project.id} project={project} onClose={() => setOpen(null)} onProject={openProject} />}
    </>
  )
  return { openCv, openCase, openProject, overlays }
}

/** True once the element has scrolled into view */
export function useSeen<T extends Element>() {
  const ref = useRef<T>(null)
  const [seen, setSeen] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setSeen(true)
          io.disconnect()
        }
      },
      { rootMargin: '0px 0px -10% 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return [ref, seen] as const
}

/** A poster that plays its recording while hovered */
export function Clip({
  project,
  className = '',
  media = project.hero,
  play,
}: {
  project: Project
  className?: string
  media?: Project['hero']
  /** leave out to play while pointed at; true/false to play from outside; 'view' to play while on screen */
  play?: boolean | 'view'
}) {
  const box = useRef<HTMLDivElement>(null)
  const video = useRef<HTMLVideoElement>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    if (play !== 'view') return
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.3 })
    io.observe(box.current!)
    return () => io.disconnect()
  }, [play])
  const on = play === 'view' ? inView : play
  useEffect(() => {
    const v = video.current
    if (!v || on === undefined) return
    if (on && !prefersReducedMotion()) v.play().catch(() => {})
    else v.pause()
  }, [on])
  const hover = play === undefined
  return (
    <div
      ref={box}
      className={`${hover ? 'still' : ''} relative overflow-hidden bg-mist ${className}`}
      onMouseEnter={hover ? () => video.current?.play().catch(() => {}) : undefined}
      onMouseLeave={
        hover
          ? () => {
              if (!video.current) return
              video.current.pause()
              video.current.currentTime = 0
            }
          : undefined
      }
    >
      <img src={media.poster} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <video
        ref={video}
        src={media.src}
        muted
        loop
        playsInline
        preload={hover ? 'none' : 'metadata'}
        className={`absolute inset-0 h-full w-full object-cover ${hover ? 'still-video' : ''}`}
      />
    </div>
  )
}

export const pad = (n: number) => String(n).padStart(2, '0')

export const jobCases = (groups: { case?: string }[]) =>
  groups.flatMap(g => {
    const c = cases.find(c => c.id === g.case)
    return c ? [c] : []
  })
