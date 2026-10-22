import { useEffect } from 'react'
import { initLenis, destroyLenis } from '@/lib/kit/lenis'
import Page from '@/components/Page'
import AsciiField from '@/components/AsciiField'

export default function App() {
  useEffect(() => {
    const lenis = initLenis()
    if (import.meta.env.DEV) Object.assign(window, { lenis })
    return destroyLenis
  }, [])

  return (
    <>
      <AsciiField />
      <div className="relative z-[1]">
        <Page />
      </div>
    </>
  )
}
