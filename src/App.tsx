import { useEffect } from 'react'
import { initLenis, destroyLenis } from '@/lib/kit/lenis'
import Page from '@/components/Page'
import Grid from '@/versions/Grid'
import Switch, { LightSwitch, useVersion } from '@/versions/Switch'

const PAGES = { original: Page, grid: Grid }

export default function App() {
  const [version, pick] = useVersion()
  const Current = PAGES[version]

  useEffect(() => {
    const lenis = initLenis()
    if (import.meta.env.DEV) Object.assign(window, { lenis })
    return destroyLenis
  }, [])

  return (
    <>
      <div className="relative z-[1]">
        <Current key={version} />
      </div>
      {import.meta.env.DEV && <Switch version={version} onPick={pick} />}
      {import.meta.env.DEV && version === 'grid' && <LightSwitch />}
    </>
  )
}
