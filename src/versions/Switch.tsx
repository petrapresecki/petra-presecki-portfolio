import { useEffect, useState } from 'react'
import { getLenis } from '@/lib/kit/lenis'

export const VERSIONS = [
  ['grid', 'Grid'],
  ['original', 'Original'],
] as const

export type Version = (typeof VERSIONS)[number][0]

const read = (): Version => {
  const v = new URLSearchParams(location.search).get('v')
  return VERSIONS.some(([id]) => id === v) ? (v as Version) : 'grid'
}

/** The version in ?v= (Grid when absent; ?v=original keeps the first site reachable), kept on <html> so each one can swap the page's tokens */
export function useVersion() {
  const [version, setVersion] = useState<Version>(read)
  useEffect(() => {
    document.documentElement.dataset.version = version
    const url = new URL(location.href)
    if (version === 'grid') url.searchParams.delete('v')
    else url.searchParams.set('v', version)
    history.replaceState(null, '', url)
  }, [version])
  const pick = (v: Version) => {
    setVersion(v)
    getLenis()?.scrollTo(0, { immediate: true })
  }
  return [version, pick] as const
}

/** A pill at the bottom to flip between the versions; only rendered in dev */
export default function Switch({ version, onPick }: { version: Version; onPick: (v: Version) => void }) {
  return (
    <div className="version-switch" role="group" aria-label="Version">
      <span>Version</span>
      {VERSIONS.map(([id, label]) => (
        <button key={id} aria-pressed={version === id} onClick={() => onPick(id)}>
          {label}
        </button>
      ))}
    </div>
  )
}

