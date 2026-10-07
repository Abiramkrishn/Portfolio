import { listMedia, listProjectsAdmin, nextCode } from "@/db/queries/admin";
import { PageHeader } from "@/components/admin/ui";
import { ProjectEditor } from "@/components/admin/project-editor";
import { emptyProject } from "../to-input";

// Per-request by design: every dashboard view reads the session and live data.
export const instant = false;

export const metadata = { title: "New project" };

export default async function NewProject({ searchParams }: PageProps<"/admin/projects/new">) {
  const { stage } = await searchParams;
  const upcoming = stage === "upcoming";
  const [code, all, media] = await Promise.all([nextCode("SYS"), listProjectsAdmin(), listMedia()]);
  const order = all.reduce((m, p) => Math.max(m, p.sortOrder), 0) + 1;

  return (
    <>
      <PageHeader kicker="Projects" title={upcoming ? "Add upcoming work" : "New project"}>
        {upcoming ? (
          <p className="mt-3 max-w-2xl text-[0.9rem] text-ink-3">
            A title, a one-line tagline and a domain are enough. It appears in &ldquo;In the workshop&rdquo; on the
            homepage and register as soon as you create it. Change the stage later to turn it into a full system file.
          </p>
        ) : null}
      </PageHeader>
      <ProjectEditor
        id={null}
        initial={emptyProject(code, order, upcoming ? "upcoming" : "in_progress")}
        media={media.map((m) => ({ id: m.id, alt: m.alt, filename: m.filename }))}
      />
    </>
  );
}
