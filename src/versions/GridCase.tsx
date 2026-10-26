import { cases, type Case } from '@/data/site'
import { ARROW } from '@/components/Page'
import CaseFilm from '@/components/films/CaseFilm'
import GridView from '@/versions/GridView'
import { pad } from '@/versions/parts'

/**
 * A case study in Grid: the original's simple order (title, summary, the case's film, then the work), set in Grid's
 * own style. The opening is a list row like the home page's, the role in a black tag; each part of the work is a
 * row with a black /1.0 bar and dense numbered points, as in Capabilities.
 */
export default function GridCase({ study, onClose, onCase }: { study: Case; onClose: () => void; onCase: (id: string) => void }) {
  const n = cases.indexOf(study) + 1
  const next = cases[n % cases.length]
  const [role, years] = study.kind.split(' · ')
  return (
    <GridView
      label={study.title}
      onClose={onClose}
      next={{ label: 'Next case', title: next.short, go: () => onCase(next.id) }}
      bar={
        <>
          <p className="cap col-span-8 md:col-span-3">
            /{pad(n)} {study.short}
          </p>
          <p className="cap hidden md:col-span-5 md:block">A closer look · Coinme</p>
        </>
      }
    >
      <div className="list-row mt-6">
        <span className="cap col-span-6 md:col-span-3">{years}</span>
        <div className="order-last col-span-12 mt-2 md:order-none md:col-span-6 md:mt-0">
          <h2 className="title-l">{study.title}</h2>
          <p className="lead-l mt-6 max-w-[32em]">{study.summary}</p>
          {study.link && (
            <a className="cap link mt-5 block w-fit" href={study.link.url} target="_blank" rel="noreferrer">
              {ARROW} {study.link.label}
            </a>
          )}
        </div>
        <span className="col-span-6 md:col-span-3">
          <span className="tag">{role}</span>
        </span>
      </div>

      {study.visual && (
        <div className="grid-12 pt-4 pb-12">
          <div className="col-span-12 md:col-[4/span_6]">
            <CaseFilm kind={study.visual} />
          </div>
        </div>
      )}

      <div className="grid-12">
        <div className="col-span-12">
          {study.sections.map((sec, i) => (
            <section key={sec.title} className="grid grid-cols-12 gap-x-[var(--gap)] rule-top py-3 md:grid-cols-9">
              <h3 className="col-span-12 md:col-span-3">
                <span className="bar">
                  /{i + 1}.0 {sec.title}
                </span>
              </h3>
              <ol className="dense-b case-points col-span-12 mt-3 space-y-2.5 md:col-span-6 md:mt-0">
                {sec.items.map((item, k) => (
                  <li key={item} className="grid grid-cols-[3em_1fr]">
                    <span className="cap text-muted">
                      /{i + 1}.{k + 1}
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ol>
            </section>
          ))}
        </div>
      </div>
    </GridView>
  )
}
