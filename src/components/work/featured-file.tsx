import Link from "next/link";
import type { PublicProject } from "@/db/queries/public";
import { layoutDiagram } from "@/lib/schematic";
import { SchematicSvg } from "@/components/schematic/schematic-svg";
import { CoverageStrip } from "@/components/schematic/coverage-strip";
import { Chip, Stage } from "@/components/ui/primitives";
import { ArrowRight } from "@/components/ui/icons";

/** The featured system file on the homepage: schematic first, story second. */
export function FeaturedFile({ project }: { project: PublicProject }) {
  const layout = project.diagram.nodes.length > 0 ? layoutDiagram(project.diagram) : null;
  return (
    <article aria-labelledby={`featured-${project.slug}`} className="reg-marks border border-rule bg-card/50">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-rule px-5 py-3 md:px-7">
        <p className="label flex items-center gap-3 text-ink-3">
          <span className="text-signal-ink">{project.code}</span>
          <span>Featured system file</span>
        </p>
        <Stage stage={project.stage} />
      </div>

      <div className="px-5 pt-7 md:px-7">
        <h3 id={`featured-${project.slug}`} className="headline">
          {project.title}
        </h3>
        {project.tagline ? <p className="lede mt-3 max-w-3xl">{project.tagline}</p> : null}
      </div>

      {layout ? (
        <div className="mt-8 hidden px-5 md:block md:px-7">
          <div className="grid-paper border border-rule bg-paper/50 p-4">
            <SchematicSvg layout={layout} compact idPrefix={`featured-${project.slug}`} />
          </div>
          {project.diagram.caption ? (
            <p className="label mt-2 text-ink-3">
              <span className="text-signal-ink">Fig.</span> {project.diagram.caption}
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="mt-8 grid gap-8 px-5 pb-7 md:px-7 lg:grid-cols-[1fr_18rem]">
        <div>
          <p className="label text-ink-3">Lifecycle coverage</p>
          <CoverageStrip coverage={project.coverage} size="lg" className="mt-3" />
        </div>
        <div className="space-y-4">
          {project.role ? (
            <div>
              <p className="label text-ink-3">Role</p>
              <p className="mt-1 text-[0.92rem] text-ink-2">{project.role}</p>
            </div>
          ) : null}
          {project.stack.length > 0 ? (
            <ul className="flex flex-wrap gap-1.5" aria-label="Stack">
              {project.stack.slice(0, 9).map((s) => (
                <li key={s}>
                  <Chip>{s}</Chip>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>

      <Link
        href={`/work/${project.slug}`}
        className="group flex items-center justify-between border-t border-rule px-5 py-4 transition-colors hover:bg-ink hover:text-paper md:px-7"
      >
        <span className="font-medium">Open the system file</span>
        <span className="mono flex items-center gap-2 text-[0.8rem]">
          <span className="hidden sm:inline">Problem · System · Decisions · Break test</span>
          <ArrowRight className="transition-transform group-hover:translate-x-1" />
        </span>
      </Link>
    </article>
  );
}
