import type { Case } from '@/data/site'
import HostsFilm from '@/components/films/HostsFilm'
import RouteFilm from '@/components/films/RouteFilm'
import VaultFilm from '@/components/films/VaultFilm'
import AgentsFilm from '@/components/films/AgentsFilm'

const FILMS = { theme: HostsFilm, flows: RouteFilm, sdk: VaultFilm, agent: AgentsFilm }

/** The short film for a case: on its page while on screen, and in the hover peek on the home page */
export default function CaseFilm({ kind, play = 'view' }: { kind: NonNullable<Case['visual']>; play?: boolean | 'view' }) {
  const Film = FILMS[kind]
  return <Film play={play} />
}
