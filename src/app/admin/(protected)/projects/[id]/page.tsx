import Link from "next/link";
import { notFound } from "next/navigation";
import { getProjectAdmin, listMedia } from "@/db/queries/admin";
import { hasCaseStudy } from "@/db/queries/public";
import { PageHeader, ReviewBanner, StatusPill } from "@/components/admin/ui";
import { ProjectEditor } from "@/components/admin/project-editor";
import { ArrowUpRight } from "@/components/ui/icons";
import { deleteProject } from "../actions";
import { projectToInput } from "../to-input";
import { ConfirmButton } from "@/components/admin/confirm-button";

// Per-request by design: every dashboard view reads the session and live data.
export const instant = false;

export const metadata = { title: "Edit project" };

const UUID = /^[0-9a-f-]{36}$/i;

export default async function EditProject({ params, searchParams }: PageProps<"/admin/projects/[id]">) {
  const { id } = await params;
  const { created } = await searchParams;
  if (!UUID.test(id)) notFound();
  const [project, media] = await Promise.all([getProjectAdmin(id), listMedia()]);
  if (!project) notFound();
  const live = project.visibility === "published" && hasCaseStudy(project);

  return (
    <>
      {project.needsReview ? <ReviewBanner what="project" /> : null}
      <PageHeader
        kicker={`Projects · ${project.code}`}
        title={project.title}
        actions={
          <>
            {live ? (
              <Link href={`/work/${project.slug}`} target="_blank" className="label inline-flex items-center gap-1 text-ink-3 hover:text-ink">
                Live page <ArrowUpRight size={11} />
              </Link>
            ) : null}
            <form action={deleteProject}>
              <input type="hidden" name="id" value={project.id} />
              <ConfirmButton message={`Delete ${project.code} “${project.title}”? This can't be undone.`}>Delete</ConfirmButton>
            </form>
          </>
        }
      >
        {created ? (
          <p className="mt-3">
            <StatusPill tone="ok">Created</StatusPill>
          </p>
        ) : null}
      </PageHeader>
      <ProjectEditor
        key={project.updatedAt.toISOString()}
        id={project.id}
        initial={projectToInput(project)}
        media={media.map((m) => ({ id: m.id, alt: m.alt, filename: m.filename }))}
      />
    </>
  );
}
