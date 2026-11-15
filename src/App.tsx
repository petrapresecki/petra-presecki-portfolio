import { useEffect } from 'react'
import { initLenis, destroyLenis } from '@/lib/kit/lenis'
import Page from '@/components/Page'
import Grid from '@/versions/Grid'
import Clean from '@/versions/Clean'
import Switch, { useVersion } from '@/versions/Switch'

const PAGES = { clean: Clean, original: Page, grid: Grid }
// the crypto edition is Clean only: the other versions keep the default site's story
const CRYPTO = import.meta.env.MODE === 'crypto'

export default function App() {
  const [version, pick] = useVersion()
  const Current = CRYPTO ? Clean : PAGES[version]

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
      {import.meta.env.DEV && !CRYPTO && <Switch version={version} onPick={pick} />}
    </>
  )
}
