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

export const LIGHTS = [
  ['asim', 'Peach & coral'],
  ['apricot', 'Apricot & lilac'],
  ['cobalt', 'Tangerine & cobalt'],
  ['sage', 'Butter & sage'],
  ['society', 'Violet & lime'],
] as const

type Light = (typeof LIGHTS)[number][0]

/** A second pill, for trying the hero light in other palettes; kept in ?light= so a link shows the same one. Dev only */
export function LightSwitch() {
  const [light, setLight] = useState<Light>(() => {
    const l = new URLSearchParams(location.search).get('light')
    return LIGHTS.some(([id]) => id === l) ? (l as Light) : 'asim'
  })
  useEffect(() => {
    document.documentElement.dataset.light = light
    const url = new URL(location.href)
    if (light === 'asim') url.searchParams.delete('light')
    else url.searchParams.set('light', light)
    history.replaceState(null, '', url)
  }, [light])
  return (
    <div className="version-switch light-switch" role="group" aria-label="Light">
      <span>Light</span>
      {LIGHTS.map(([id, label]) => (
        <button key={id} aria-pressed={light === id} onClick={() => setLight(id)}>
          {label}
        </button>
      ))}
    </div>
  )
}
