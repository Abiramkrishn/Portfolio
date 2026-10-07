import Link from "next/link";
import { listLogAdmin } from "@/db/queries/admin";
import { PageHeader, SmallLink, StatusPill } from "@/components/admin/ui";
import { KIND_LABEL, formatDate } from "@/components/lab/log-list";

// Per-request by design: every dashboard view reads the session and live data.
export const instant = false;

export const metadata = { title: "Lab" };

export default async function LabAdmin() {
  const rows = await listLogAdmin();
  return (
    <>
      <PageHeader
        kicker="Content"
        title="Lab"
        actions={
          <SmallLink href="/admin/lab/new" variant="primary">
            New entry
          </SmallLink>
        }
      >
        <p className="mt-3 max-w-2xl text-[0.9rem] text-ink-3">
          Build logs, security work, experiments and notes. Published entries appear on /lab, the homepage and the RSS feed.
        </p>
      </PageHeader>
      <div className="px-4 py-6 md:px-8">
        {rows.length === 0 ? (
          <p className="text-ink-3">No entries yet.</p>
        ) : (
          <ol className="divide-y divide-rule border-y border-rule">
            {rows.map(({ entry, projectCode }) => (
              <li key={entry.id}>
                <Link href={`/admin/lab/${entry.id}`} className="group flex flex-wrap items-center gap-x-4 gap-y-1 py-3">
                  <span className="label w-16 shrink-0 text-signal-ink">{entry.code}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium group-hover:text-signal-ink">{entry.title}</span>
                    <span className="block text-[0.82rem] text-ink-3">
                      {KIND_LABEL[entry.kind]}
                      {entry.publishedAt ? ` · ${formatDate(entry.publishedAt)}` : ""}
                      {projectCode ? ` · ${projectCode}` : ""}
                    </span>
                  </span>
                  <span className="flex gap-2">
                    {entry.visibility === "published" ? <StatusPill tone="ok">Published</StatusPill> : <StatusPill tone="muted">Draft</StatusPill>}
                    {entry.needsReview ? <StatusPill tone="signal">Review</StatusPill> : null}
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        )}
      </div>
    </>
  );
}
