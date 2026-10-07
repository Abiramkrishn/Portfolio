import Link from "next/link";
import { DOMAINS, type DomainKey } from "@/content/taxonomy";
import { hasCaseStudy, type PublicProject } from "@/db/queries/public";
import { CoverageStrip } from "@/components/schematic/coverage-strip";
import { Stage, cx } from "@/components/ui/primitives";
import { ArrowRight } from "@/components/ui/icons";

export function domainList(domains: string[]) {
  return domains.map((d) => DOMAINS[d as DomainKey]?.short ?? d).join(" · ");
}

/**
 * One line in the system register. Projects with a write-up link to their system file;
 * the rest are listed honestly as "write-up in progress".
 */
export function RegisterRow({ project, headingLevel = 3 }: { project: PublicProject; headingLevel?: 2 | 3 }) {
  const linked = hasCaseStudy(project);
  const H = `h${headingLevel}` as const;
  const body = (
    <>
      <span className="label pt-1 text-signal-ink md:pt-1.5">{project.code}</span>
      <span className="min-w-0">
        <H className="title flex flex-wrap items-center gap-x-2">
          <span className={cx(linked && "transition-colors group-hover:text-signal-ink")}>{project.title}</span>
          {project.visibility === "draft" ? <span className="label text-signal-ink">Draft</span> : null}
        </H>
        {project.tagline ? <span className="mt-1 block max-w-2xl text-[0.95rem] text-ink-2">{project.tagline}</span> : null}
        {project.domains.length > 0 ? (
          <span className="label mt-3 block text-ink-3">{domainList(project.domains)}</span>
        ) : null}
        {/* Phones: stage and coverage sit under the text. */}
        <span className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 md:hidden">
          <Stage stage={project.stage} />
          <CoverageStrip coverage={project.coverage} />
          {!linked ? <span className="label text-ink-3">Write-up in progress</span> : null}
        </span>
      </span>
      <span className="hidden flex-col items-start gap-2 pt-1.5 md:flex">
        <Stage stage={project.stage} />
        <CoverageStrip coverage={project.coverage} />
        {!linked ? <span className="label text-ink-3">Write-up in progress</span> : null}
      </span>
      <span className="hidden justify-end pt-1 md:flex">
        {linked ? (
          <span className="inline-flex size-9 items-center justify-center rounded-full border border-rule-strong text-ink transition-colors group-hover:border-ink group-hover:bg-ink group-hover:text-paper">
            <ArrowRight />
          </span>
        ) : null}
      </span>
    </>
  );

  return (
    <li id={project.slug} data-row data-domains={project.domains.join(" ")} data-slug={project.slug} className="scroll-mt-24 border-b border-rule">
      {linked ? (
        <Link href={`/work/${project.slug}`} className={cx(ROW_GRID, "group")}>
          {body}
        </Link>
      ) : (
        <div className={ROW_GRID}>{body}</div>
      )}
    </li>
  );
}

// One grid for header and rows. The flexible column holds title, tagline and domains, so it
// never gets squeezed: phones stack everything; from md the meta and arrow get columns.
const ROW_GRID =
  "grid grid-cols-[4.5rem_minmax(0,1fr)] gap-x-3 gap-y-2 py-6 md:grid-cols-[5.5rem_minmax(0,1fr)_10rem_2.25rem] md:gap-x-6";

export function RegisterHeader() {
  return (
    <div
      aria-hidden="true"
      className="label hidden grid-cols-[5.5rem_minmax(0,1fr)_10rem_2.25rem] gap-x-6 border-b border-rule pb-3 text-ink-3 md:grid"
    >
      <span>File</span>
      <span>System · domains</span>
      <span>Stage · coverage</span>
      <span />
    </div>
  );
}

export function Workshop({ projects }: { projects: PublicProject[] }) {
  if (projects.length === 0) return null;
  return (
    <div className="mt-14">
      <p className="label flex items-center gap-2 text-ink-3">
        <span aria-hidden="true" className="size-1.5 animate-pulse rounded-full bg-signal motion-reduce:animate-none" />
        In the workshop
      </p>
      <ul className="mt-4 grid gap-px overflow-hidden rounded-[4px] border border-rule bg-rule sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((p) => (
          <li key={p.id} className="bg-card p-5">
            <p className="label flex items-center justify-between text-ink-3">
              <span className="text-signal-ink">{p.code}</span>
              <Stage stage={p.stage} />
            </p>
            <p className="mt-3 font-medium text-ink">{p.title}</p>
            {p.tagline ? <p className="mt-1 text-[0.92rem] text-ink-2">{p.tagline}</p> : null}
            {p.domains.length > 0 ? <p className="label mt-4 text-ink-3">{domainList(p.domains)}</p> : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
