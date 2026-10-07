import Link from "next/link";
import { adminCounts, getSettingsAdmin, listInquiries, listLogAdmin, listProjectsAdmin } from "@/db/queries/admin";
import { availabilityLabel } from "@/components/site/availability";
import { PageHeader, SmallLink, StatusPill } from "@/components/admin/ui";
import { logoutEverywhere } from "../auth-actions";

// Per-request by design: every dashboard view reads the session and live data.
export const instant = false;

export const metadata = { title: "Overview" };

export default async function AdminHome() {
  const [counts, settings, inquiries, projects, log] = await Promise.all([
    adminCounts(),
    getSettingsAdmin(),
    listInquiries(),
    listProjectsAdmin(),
    listLogAdmin(),
  ]);
  const review = [
    ...projects.filter((p) => p.needsReview).map((p) => ({ code: p.code, title: p.title, href: `/admin/projects/${p.id}` })),
    ...log.filter((l) => l.entry.needsReview).map(({ entry }) => ({ code: entry.code, title: entry.title, href: `/admin/lab/${entry.id}` })),
  ];
  const stats = [
    { label: "Published projects", value: counts.projects.published, href: "/admin/projects" },
    { label: "Drafts", value: counts.projects.drafts, href: "/admin/projects" },
    { label: "Upcoming", value: counts.projects.upcoming, href: "/admin/projects" },
    { label: "Lab entries live", value: counts.lab.published, href: "/admin/lab" },
    { label: "New inquiries", value: counts.inquiries.fresh, href: "/admin/inquiries", hot: counts.inquiries.fresh > 0 },
  ];

  return (
    <>
      <PageHeader
        kicker="Overview"
        title="Good to see you."
        actions={
          <>
            <SmallLink href="/admin/projects/new?stage=upcoming" variant="primary">
              Add upcoming work
            </SmallLink>
            <SmallLink href="/admin/projects/new">New project</SmallLink>
            <SmallLink href="/admin/lab/new">New lab entry</SmallLink>
          </>
        }
      />
      <div className="space-y-10 px-4 py-8 md:px-8">
        <ul className="grid grid-cols-2 gap-px overflow-hidden rounded-[6px] border border-rule bg-rule md:grid-cols-5">
          {stats.map((s) => (
            <li key={s.label} className="bg-paper">
              <Link href={s.href} className="block p-4 hover:bg-card">
                <span className={`block text-[2rem] font-semibold tracking-[-0.03em] ${s.hot ? "text-signal-ink" : ""}`}>{s.value}</span>
                <span className="label text-ink-3">{s.label}</span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="grid gap-8 lg:grid-cols-2">
          <section>
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Recent inquiries</h2>
              <Link href="/admin/inquiries" className="label text-ink-3 hover:text-ink">
                All →
              </Link>
            </div>
            {inquiries.length === 0 ? (
              <p className="mt-3 text-[0.92rem] text-ink-3">No briefs yet. They&apos;ll appear here when someone uses /hire.</p>
            ) : (
              <ul className="mt-3 divide-y divide-rule border-y border-rule">
                {inquiries.slice(0, 6).map((q) => (
                  <li key={q.id}>
                    <Link href={`/admin/inquiries/${q.id}`} className="flex items-center justify-between gap-3 py-3 hover:text-signal-ink">
                      <span className="min-w-0">
                        <span className="block truncate font-medium">{q.name}</span>
                        <span className="block truncate text-[0.85rem] text-ink-3">{q.message.slice(0, 90)}</span>
                      </span>
                      {q.status === "new" ? <StatusPill tone="signal">New</StatusPill> : <StatusPill tone="muted">{q.status}</StatusPill>}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="space-y-8">
            <div>
              <h2 className="font-semibold">Availability</h2>
              <p className="mt-2 text-[0.95rem] text-ink-2">{availabilityLabel(settings)}</p>
              <Link href="/admin/settings" className="label mt-2 inline-block text-ink-3 hover:text-ink">
                Change in settings →
              </Link>
            </div>
            {review.length > 0 ? (
              <div>
                <h2 className="font-semibold">Needs your review</h2>
                <p className="mt-1 text-[0.88rem] text-ink-3">
                  Seeded from your brief. Verify the wording, add real detail, then clear the flag.
                </p>
                <ul className="mt-3 divide-y divide-rule border-y border-rule">
                  {review.map((r) => (
                    <li key={r.href}>
                      <Link href={r.href} className="flex items-center gap-3 py-2.5 hover:text-signal-ink">
                        <span className="label text-signal-ink">{r.code}</span>
                        <span>{r.title}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            <div>
              <h2 className="font-semibold">Sessions</h2>
              <p className="mt-1 text-[0.88rem] text-ink-3">Signs out every browser, including this one.</p>
              <form action={logoutEverywhere} className="mt-2">
                <button type="submit" className="label text-ink-2 underline underline-offset-2 hover:text-signal-ink">
                  Sign out everywhere
                </button>
              </form>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
