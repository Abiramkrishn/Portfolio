import Link from "next/link";
import { notFound } from "next/navigation";
import { getLogAdmin, projectOptions } from "@/db/queries/admin";
import { PageHeader, ReviewBanner, StatusPill } from "@/components/admin/ui";
import { LogEditor } from "@/components/admin/log-editor";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { ArrowUpRight } from "@/components/ui/icons";
import { deleteLog } from "../actions";

// Per-request by design: every dashboard view reads the session and live data.
export const instant = false;

export const metadata = { title: "Edit lab entry" };

const UUID = /^[0-9a-f-]{36}$/i;

export default async function EditLog({ params, searchParams }: PageProps<"/admin/lab/[id]">) {
  const { id } = await params;
  const { created } = await searchParams;
  if (!UUID.test(id)) notFound();
  const [entry, projects] = await Promise.all([getLogAdmin(id), projectOptions()]);
  if (!entry) notFound();

  return (
    <>
      {entry.needsReview ? <ReviewBanner what="lab entry" /> : null}
      <PageHeader
        kicker={`Lab · ${entry.code}`}
        title={entry.title}
        actions={
          <>
            {entry.visibility === "published" ? (
              <Link href={`/lab/${entry.slug}`} target="_blank" className="label inline-flex items-center gap-1 text-ink-3 hover:text-ink">
                Live page <ArrowUpRight size={11} />
              </Link>
            ) : null}
            <form action={deleteLog}>
              <input type="hidden" name="id" value={entry.id} />
              <ConfirmButton message={`Delete ${entry.code} “${entry.title}”? This can't be undone.`}>Delete</ConfirmButton>
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
      <LogEditor
        key={entry.updatedAt.toISOString()}
        id={entry.id}
        projects={projects}
        initial={{
          slug: entry.slug,
          code: entry.code,
          kind: entry.kind,
          title: entry.title,
          summary: entry.summary,
          body: entry.body,
          tags: entry.tags,
          projectId: entry.projectId,
          links: entry.links,
          visibility: entry.visibility,
          publishedAt: entry.publishedAt ? entry.publishedAt.toISOString().slice(0, 10) : "",
          needsReview: entry.needsReview,
        }}
      />
    </>
  );
}
