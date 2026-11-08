import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@/index.css'
import { cases } from '@/data/site'
import CaseFilm from '@/components/films/CaseFilm'
import { FilmLook, LEAD } from '@/components/films/Film'

/** Dev-only page: each case film as it is now beside the proposed thermal look, for approval before it ships */
function Lab() {
  const shown = cases.filter(c => c.visual)
  return (
    <main className="clean-v min-h-screen px-(--margin) pt-8 pb-24">
      <header className="grid-12 !px-0 gap-y-3 border-b border-(--color-rule) pb-4">
        <p className="cap col-span-12 md:col-span-4">Films · now vs proposed</p>
        <p className="c-body col-span-12 max-w-[60ch] text-[15px] md:col-span-8">
          Left is what the case pages show today. Right is the proposal: the same films and timing, with every light turned
          into a heat reading (stronger means hotter, through orange and blue to a yellow core), places as pills, labels
          in mono on lime, and specimen labels with a running counter around the frame.
        </p>
      </header>
      {shown.map((c, i) => (
        <section key={c.id} className="mt-12">
          <p className="cap mb-3">
            <span className="c-dim">{String(i + 1).padStart(2, '0')}.</span> {c.short}
          </p>
          <div className="grid gap-[var(--gap)] lg:grid-cols-2">
            <figure>
              <div className="bg-paper ring-1 ring-(--color-rule)">
                <CaseFilm kind={c.visual!} />
              </div>
              <figcaption className="cap c-dim mt-2">Now</figcaption>
            </figure>
            <figure>
              <div className="bg-white ring-1 ring-(--color-rule)">
                <FilmLook.Provider value={{ look: 'thermal', n: i + 1, name: c.short, lead: LEAD[c.visual!] }}>
                  <CaseFilm kind={c.visual!} />
                </FilmLook.Provider>
              </div>
              <figcaption className="cap mt-2">Proposed · thermal</figcaption>
            </figure>
          </div>
        </section>
      ))}
    </main>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Lab />
  </StrictMode>,
)
