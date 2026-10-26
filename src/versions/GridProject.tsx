import { projects, type Media, type Project } from '@/data/site'
import { ARROW } from '@/components/Page'
import GridView, { Points, Row } from '@/versions/GridView'
import { pad } from '@/versions/parts'

/**
 * A side project in Grid, laid out as the cases are: name, lead and role on the left half with the facts as
 * tagged rows, the main recording on the right half, the rest of the recordings two by two under them.
 */
export default function GridProject({ project, onClose, onProject }: { project: Project; onClose: () => void; onProject: (id: string) => void }) {
  const i = projects.indexOf(project)
  const next = projects[(i + 1) % projects.length]
  const role = project.facts.find(([k]) => k === 'Role')?.[1]
  const facts = project.facts.filter(([k]) => k !== 'Role')
  return (
    <GridView
      label={project.title}
      onClose={onClose}
      next={{ label: 'Next project', title: next.title, go: () => onProject(next.id) }}
      bar={
        <>
          <p className="cap col-span-8 md:col-span-3">
            /P.{pad(i + 6)} {project.title}
          </p>
          <p className="cap hidden md:col-span-3 md:block">{project.kind}</p>
          <p className="cap hidden md:col-span-4 md:block">
            {project.url && (
              <a className="link" href={project.url} target="_blank" rel="noreferrer">
                {ARROW} Visit the site
              </a>
            )}
          </p>
        </>
      }
    >
      <article className="grid-12 gap-y-12 pt-6">
        <div className="col-span-12 md:col-span-6">
          <h2 className="title-l">{project.title}</h2>
          <p className="lead-l mt-3">{project.summary}</p>
          {project.url ? (
            <a className="cap link mt-4 block w-fit" href={project.url} target="_blank" rel="noreferrer">
              {ARROW} {project.url.replace(/^https?:\/\//, '').replace(/\/$/, '')}
            </a>
          ) : (
            project.note && <p className="cap mt-4 text-muted">{project.note}</p>
          )}
          {role && (
            <p className="title-l mt-20 md:mt-28">
              {role}
              <br />
              <span className="text-muted">/ {project.year}</span>
            </p>
          )}

          <div className="mt-16 md:mt-24">
            {facts.map(([k, v]) => (
              <Row key={k} label={k}>
                <p>{v}</p>
              </Row>
            ))}
            <Row label="How it works">
              <Points n={1} items={project.details} />
            </Row>
          </div>
        </div>

        <div className="col-span-12 md:col-[7/span_6]">
          <Film media={project.hero} eager />
        </div>
      </article>

      <section className="grid-12 mt-16 gap-y-[var(--gap)]">
        {[...project.wide, ...project.cells].map(m => (
          <div key={m.name} className="col-span-12 md:col-span-6">
            <Film media={m} />
          </div>
        ))}
      </section>
    </GridView>
  )
}

/** A recording, playing on its own, with abgd.it's soft corners */
function Film({ media, eager = false }: { media: Media; eager?: boolean }) {
  return (
    <video
      src={media.src}
      poster={media.poster}
      muted
      loop
      playsInline
      autoPlay
      preload={eager ? 'auto' : 'metadata'}
      className="aspect-[16/10] w-full rounded-[10px] bg-mist object-cover"
    />
  )
}
