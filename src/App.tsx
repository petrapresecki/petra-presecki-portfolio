import { useEffect } from 'react'
import { initLenis, destroyLenis } from '@/lib/kit/lenis'
import Page from '@/components/Page'

export default function App() {
  useEffect(() => {
    const lenis = initLenis()
    if (import.meta.env.DEV) Object.assign(window, { lenis })
    return destroyLenis
  }, [])

  return <Page />
}
