import Link from "next/link";
import { listProjectsAdmin } from "@/db/queries/admin";
import { hasCaseStudy } from "@/db/queries/public";
import { PageHeader, SmallLink, StatusPill } from "@/components/admin/ui";
import { CoverageStrip } from "@/components/schematic/coverage-strip";
import { moveProject } from "./actions";

// Per-request by design: every dashboard view reads the session and live data.
export const instant = false;

export const metadata = { title: "Projects" };

export default async function ProjectsAdmin() {
  const projects = await listProjectsAdmin();

  return (
    <>
      <PageHeader
        kicker="Content"
        title="Projects"
        actions={
          <>
            <SmallLink href="/admin/projects/new?stage=upcoming">Add upcoming work</SmallLink>
            <SmallLink href="/admin/projects/new" variant="primary">
              New project
            </SmallLink>
          </>
        }
      >
        <p className="mt-3 max-w-2xl text-[0.9rem] text-ink-3">
          Order here is the order in the public register. <strong className="font-medium text-ink-2">Upcoming</strong>{" "}
          projects appear in &ldquo;In the workshop&rdquo;; a project gets its own page once its Problem is written.
        </p>
      </PageHeader>

      <div className="px-4 py-6 md:px-8">
        <ol className="divide-y divide-rule border-y border-rule">
          {projects.map((p, i) => (
            <li key={p.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3">
              <div className="flex gap-0.5">
                {(["up", "down"] as const).map((dir) => (
                  <form key={dir} action={moveProject}>
                    <input type="hidden" name="id" value={p.id} />
                    <input type="hidden" name="dir" value={dir} />
                    <button
                      type="submit"
                      disabled={dir === "up" ? i === 0 : i === projects.length - 1}
                      aria-label={`Move ${p.title} ${dir}`}
                      className="mono size-7 rounded-[3px] text-ink-3 hover:bg-card hover:text-ink disabled:opacity-25"
                    >
                      {dir === "up" ? "↑" : "↓"}
                    </button>
                  </form>
                ))}
              </div>
              <Link href={`/admin/projects/${p.id}`} className="group flex min-w-0 flex-1 items-center gap-3">
                <span className="label w-16 shrink-0 text-signal-ink">{p.code}</span>
                <span className="min-w-0">
                  <span className="block truncate font-medium group-hover:text-signal-ink">{p.title}</span>
                  <span className="block truncate text-[0.82rem] text-ink-3">/work/{p.slug}</span>
                </span>
              </Link>
              <div className="flex flex-wrap items-center gap-2">
                <CoverageStrip coverage={p.coverage} />
                {p.stage === "upcoming" ? <StatusPill tone="ink">Upcoming</StatusPill> : null}
                {p.visibility === "published" ? <StatusPill tone="ok">Published</StatusPill> : <StatusPill tone="muted">Draft</StatusPill>}
                {p.featured ? <StatusPill tone="signal">Featured</StatusPill> : null}
                {p.needsReview ? <StatusPill tone="signal">Review</StatusPill> : null}
                {!hasCaseStudy(p) && p.stage !== "upcoming" ? <StatusPill tone="muted">No page yet</StatusPill> : null}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </>
  );
}
