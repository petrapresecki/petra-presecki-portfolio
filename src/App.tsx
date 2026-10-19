import { useEffect, useRef, useState } from 'react'
import { initLenis, destroyLenis, getLenis } from '@/lib/kit/lenis'
import { ScrollTrigger } from '@/lib/kit/gsap'
import ColumnCurtain, { type CurtainHandle } from '@/components/kit/column-curtain/ColumnCurtain'
import Header from '@/components/Header'
import Home from '@/components/Home'
import { AboutPanel, ExperiencePanel, ProjectPanel } from '@/components/Panels'
import { CursorLabel } from '@/components/Parts'
import { parse, takeTop, type Route } from '@/lib/route'

export default function App() {
  const [route, setRoute] = useState<Route>(() => parse())
  const curtain = useRef<CurtainHandle>(null)

  useEffect(() => {
    const lenis = initLenis()
    if (import.meta.env.DEV) Object.assign(window, { lenis })
    return destroyLenis
  }, [])

  // every route change runs under the column curtain: bars drop into the four columns, the view swaps, the bars leave
  useEffect(() => {
    const on = () =>
      curtain.current?.run(() => {
        setRoute(parse())
        if (takeTop()) getLenis()?.scrollTo(0, { immediate: true })
      })
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])

  // home keeps its scroll position underneath; it only scrolls while no panel is open
  useEffect(() => {
    const lenis = getLenis()
    if (route.page === 'home') {
      lenis?.start()
      ScrollTrigger.refresh()
    } else lenis?.stop()
  }, [route])

  return (
    <>
      <Header route={route} />
      <Home />
      {route.page === 'project' && <ProjectPanel key={route.id} id={route.id} />}
      {route.page === 'experience' && <ExperiencePanel />}
      {route.page === 'about' && <AboutPanel />}
      <ColumnCurtain ref={curtain} columns={4} className="bg-ink" duration={0.5} />
      <CursorLabel />
    </>
  )
}
