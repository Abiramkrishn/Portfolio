import Link from "next/link";
import { listInquiries } from "@/db/queries/admin";
import { engagements, type EngagementKey } from "@/content/site";
import { PageHeader, StatusPill } from "@/components/admin/ui";

// Per-request by design: every dashboard view reads the session and live data.
export const instant = false;

export const metadata = { title: "Inquiries" };

const fmt = (d: Date) =>
  d.toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

export default async function InquiriesAdmin({ searchParams }: PageProps<"/admin/inquiries">) {
  const { show } = await searchParams;
  const all = await listInquiries();
  const archived = show === "archived";
  const rows = all.filter((q) => (archived ? q.status === "archived" : q.status !== "archived"));

  return (
    <>
      <PageHeader kicker="Inbox" title="Inquiries">
        <nav className="mt-4 flex gap-4 text-[0.9rem]" aria-label="Filter">
          <Link href="/admin/inquiries" aria-current={!archived ? "page" : undefined} className={!archived ? "font-medium text-ink" : "text-ink-3 hover:text-ink"}>
            Active ({all.filter((q) => q.status !== "archived").length})
          </Link>
          <Link
            href="/admin/inquiries?show=archived"
            aria-current={archived ? "page" : undefined}
            className={archived ? "font-medium text-ink" : "text-ink-3 hover:text-ink"}
          >
            Archived ({all.filter((q) => q.status === "archived").length})
          </Link>
        </nav>
      </PageHeader>
      <div className="px-4 py-6 md:px-8">
        {rows.length === 0 ? (
          <p className="text-ink-3">{archived ? "Nothing archived." : "No briefs yet. They arrive from the form on /hire."}</p>
        ) : (
          <ol className="divide-y divide-rule border-y border-rule">
            {rows.map((q) => (
              <li key={q.id}>
                <Link href={`/admin/inquiries/${q.id}`} className="group grid gap-1 py-3.5 md:grid-cols-[10rem_1fr_auto] md:gap-4">
                  <span className="mono text-[0.8rem] text-ink-3">{fmt(q.createdAt)}</span>
                  <span className="min-w-0">
                    <span className={`block truncate ${q.status === "new" ? "font-semibold" : "font-medium"} group-hover:text-signal-ink`}>
                      {q.name}
                      {q.company ? <span className="font-normal text-ink-3"> · {q.company}</span> : null}
                    </span>
                    <span className="block truncate text-[0.88rem] text-ink-2">{q.message}</span>
                    {q.engagements.length ? (
                      <span className="label mt-1 block text-ink-3">
                        {q.engagements.map((e) => engagements[e as EngagementKey]?.label ?? e).join(" · ")}
                      </span>
                    ) : null}
                  </span>
                  <span>
                    <StatusPill tone={q.status === "new" ? "signal" : q.status === "replied" ? "ok" : "muted"}>{q.status}</StatusPill>
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
