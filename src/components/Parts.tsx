import { useEffect, useRef, useState } from 'react'
import { gsap, useGSAP, prefersReducedMotion } from '@/lib/kit/gsap'
import type { Media as MediaItem } from '@/data/site'

/** The page grid drawn as full-height hairlines, one at each column's left edge and one closing the right. */
export function GridLines({ draw = false }: { draw?: boolean }) {
  const root = useRef<HTMLDivElement>(null)
  useGSAP(
    () => {
      if (!draw || prefersReducedMotion()) return
      gsap.from('.gl', { scaleY: 0, transformOrigin: '50% 0%', duration: 1.6, ease: 'expo.inOut', stagger: 0.08 })
    },
    { scope: root },
  )
  // each line sits in the middle of the gutter, 5px left of its column
  return (
    <div ref={root} aria-hidden className="pointer-events-none absolute inset-0 z-0">
      <div className="cols h-full">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className={`gl -ml-[5px] border-l border-rule ${i >= 2 ? 'max-md:hidden' : ''}`} />
        ))}
      </div>
      <div className="gl absolute top-0 right-[5px] bottom-0 border-r border-rule" />
    </div>
  )
}

/** A recording or a still. Videos play only while on screen. It uncovers itself the first time it scrolls in. */
export function Media({ media, className = '', cover = true, reveal = true }: { media: MediaItem; className?: string; cover?: boolean; reveal?: boolean }) {
  const box = useRef<HTMLDivElement>(null)
  const inner = useRef<HTMLDivElement>(null)
  const video = useRef<HTMLVideoElement>(null)
  const isVideo = media.src.endsWith('.webm') || media.src.endsWith('.mp4')

  useEffect(() => {
    const v = video.current
    if (!v) return
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? v.play().catch(() => {}) : v.pause()), { rootMargin: '120px' })
    io.observe(v)
    return () => io.disconnect()
  }, [])

  useGSAP(() => {
    if (!reveal || prefersReducedMotion()) return
    const st = { trigger: box.current, start: 'top 92%', once: true }
    gsap.fromTo(box.current, { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.3, ease: 'expo.inOut', scrollTrigger: st })
    gsap.fromTo(inner.current, { scale: 1.18 }, { scale: 1, duration: 1.8, ease: 'expo.out', scrollTrigger: st })
  })

  const fit = cover ? 'h-full w-full object-cover object-top' : 'h-auto w-full'
  return (
    <div ref={box} className={`relative overflow-hidden bg-mist ${className}`}>
      <div ref={inner} className={cover ? 'h-full w-full' : ''}>
        {isVideo ? (
          <video ref={video} src={media.src} poster={media.poster} muted loop playsInline preload="metadata" className={fit} />
        ) : (
          <img src={media.src} alt="" loading="lazy" draggable={false} className={fit} />
        )}
      </div>
      <span className="label pointer-events-none absolute bottom-0 left-0 bg-paper px-1.5 pt-1 text-[11px] normal-case">{media.name}</span>
    </div>
  )
}

/** A pill that trails the pointer over anything marked data-cursor="…" */
export function CursorLabel() {
  const el = useRef<HTMLDivElement>(null)
  const [text, setText] = useState<string | null>(null)
  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return
    const x = gsap.quickTo(el.current, 'x', { duration: 0.45, ease: 'expo.out' })
    const y = gsap.quickTo(el.current, 'y', { duration: 0.45, ease: 'expo.out' })
    const move = (e: PointerEvent) => {
      x(e.clientX + 14)
      y(e.clientY + 14)
      const t = (e.target as HTMLElement).closest<HTMLElement>('[data-cursor]')
      setText(t?.dataset.cursor ?? null)
    }
    window.addEventListener('pointermove', move)
    return () => window.removeEventListener('pointermove', move)
  }, [])
  return (
    <div ref={el} className="pointer-events-none fixed top-0 left-0 z-[95]">
      <span className={`label block bg-accent px-1.5 py-1 text-paper transition-[opacity,scale] duration-300 ease-out-expo ${text ? 'scale-100 opacity-100' : 'scale-75 opacity-0'}`}>{text ?? ''}</span>
    </div>
  )
}

/** The real site in a frame over everything */
export function LiveFrame({ title, url, onClose }: { title: string; url: string; onClose: () => void }) {
  const [loaded, setLoaded] = useState(false)
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      e.stopImmediatePropagation()
      onClose()
    }
    window.addEventListener('keydown', key, true)
    return () => window.removeEventListener('keydown', key, true)
  }, [onClose])
  const host = url.replace(/^https?:\/\//, '').replace(/\/$/, '')
  return (
    <div role="dialog" aria-label={`${title}, live`} className="fixed inset-0 z-[85] flex flex-col bg-ink text-paper">
      <div className="label cols h-9 shrink-0 items-center">
        <span className="flex items-center gap-2">
          <span className={`size-[7px] ${loaded ? 'bg-accent' : 'animate-pulse bg-paper/40'}`} />
          {title}
        </span>
        <span className="truncate text-paper/50 normal-case max-md:hidden">{host}</span>
        <a href={url} target="_blank" rel="noreferrer" className="hover:text-paper/60 max-md:hidden">
          New tab ↗
        </a>
        <button onClick={onClose} className="label justify-self-end hover:text-paper/60">
          Close ×
        </button>
      </div>
      <iframe src={url} title={`${title}, live site`} onLoad={() => setLoaded(true)} className="flex-1 border-0 bg-white" allow="autoplay; fullscreen" />
    </div>
  )
}
