import { projects } from '@/data/site'
import { getLenis } from '@/lib/kit/lenis'

// Hash routes, so every fullscreen view has its own link and the back button closes it:
// #/            home
// #/work/iva    a project
// #/experience  the CV
// #/about
export type Route = { page: 'home' } | { page: 'experience' } | { page: 'about' } | { page: 'project'; id: string }

export function parse(hash = location.hash): Route {
  const [, a, b] = hash.replace(/^#/, '').split('/')
  if (a === 'work' && projects.some(p => p.id === b)) return { page: 'project', id: b }
  if (a === 'experience' || a === 'about') return { page: a }
  return { page: 'home' }
}

const toHash = (r: Route) => (r.page === 'home' ? '#/' : r.page === 'project' ? `#/work/${r.id}` : `#/${r.page}`)

let pendingTop = false

/** Go somewhere. With `top`, home also scrolls back to the start. */
export function go(r: Route, { top = false } = {}) {
  const hash = toHash(r)
  if (hash === (location.hash || '#/')) {
    if (top) getLenis()?.scrollTo(0, { duration: 1.4 })
    return
  }
  pendingTop = top
  location.hash = hash
}

/** Whether the last `go` asked for the top of the page; reading it clears it. */
export function takeTop() {
  const t = pendingTop
  pendingTop = false
  return t
}
