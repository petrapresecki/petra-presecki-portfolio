import type { Case } from '@/data/site'
import ThemeFilm from '@/components/films/ThemeFilm'
import FlowsFilm from '@/components/films/FlowsFilm'
import VaultFilm from '@/components/films/VaultFilm'
import AgentsFilm from '@/components/films/AgentsFilm'

const FILMS = { theme: ThemeFilm, flows: FlowsFilm, sdk: VaultFilm, agent: AgentsFilm }

/** The short film for a case: on its page while on screen, and in the hover peek on the home page */
export default function CaseFilm({ kind, play = 'view' }: { kind: NonNullable<Case['visual']>; play?: boolean | 'view' }) {
  const Film = FILMS[kind]
  return <Film play={play} />
}
