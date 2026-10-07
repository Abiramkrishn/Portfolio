import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { inquiries } from "@/db/schema";
import { getInquiry } from "@/db/queries/admin";
import { engagements, type EngagementKey } from "@/content/site";
import { INQUIRY_STATUSES } from "@/lib/types";
import { PageHeader, StatusPill } from "@/components/admin/ui";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { buttonClass, cx } from "@/components/ui/primitives";
import { ArrowLeft } from "@/components/ui/icons";
import { deleteInquiry, setInquiryStatus } from "../actions";

// Per-request by design: every dashboard view reads the session and live data.
export const instant = false;

export const metadata = { title: "Inquiry" };

const UUID = /^[0-9a-f-]{36}$/i;

export default async function InquiryDetail({ params }: PageProps<"/admin/inquiries/[id]">) {
  const { id } = await params;
  if (!UUID.test(id)) notFound();
  let q = await getInquiry(id);
  if (!q) notFound();
  // Opening a new brief marks it read.
  if (q.status === "new") {
    await db.update(inquiries).set({ status: "read" }).where(eq(inquiries.id, id));
    q = { ...q, status: "read" };
  }

  const subject = encodeURIComponent(`Re: your project brief`);
  const rows: [string, string][] = [
    ["Email", q.email],
    ["Company", q.company || "Not given"],
    ["Looking for", q.engagements.map((e) => engagements[e as EngagementKey]?.label ?? e).join(", ") || "Not given"],
    ["Where they are", q.currentState || "Not given"],
    ["Timeline", q.timeline || "Not given"],
    ["Budget", q.budget || "Not given"],
    ["Received", q.createdAt.toLocaleString("en-GB")],
  ];

  return (
    <>
      <PageHeader
        kicker="Inquiry"
        title={q.name}
        actions={
          <>
            <a href={`mailto:${q.email}?subject=${subject}`} className={cx(buttonClass("primary"), "min-h-9 px-3 text-[0.88rem]")}>
              Reply by email
            </a>
            <form action={deleteInquiry}>
              <input type="hidden" name="id" value={q.id} />
              <ConfirmButton message={`Delete the brief from ${q.name}? This can't be undone.`}>Delete</ConfirmButton>
            </form>
          </>
        }
      >
        <Link href="/admin/inquiries" className="label mt-3 inline-flex items-center gap-1.5 text-ink-3 hover:text-ink">
          <ArrowLeft size={12} /> All inquiries
        </Link>
      </PageHeader>

      <div className="grid gap-8 px-4 py-6 md:px-8 lg:grid-cols-[1fr_20rem]">
        <section>
          <h2 className="label text-ink-3">Their words</h2>
          <p className="mt-3 max-w-3xl whitespace-pre-wrap text-[1rem] leading-relaxed">{q.message}</p>
        </section>
        <aside className="space-y-6">
          <dl className="divide-y divide-rule border-y border-rule">
            {rows.map(([k, v]) => (
              <div key={k} className="grid grid-cols-[7rem_1fr] gap-3 py-2.5 text-[0.9rem]">
                <dt className="label pt-0.5 text-ink-3">{k}</dt>
                <dd className="min-w-0 break-words">{v}</dd>
              </div>
            ))}
          </dl>
          <div>
            <p className="label text-ink-3">Status</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {INQUIRY_STATUSES.filter((s) => s !== "new").map((s) => (
                <form key={s} action={setInquiryStatus}>
                  <input type="hidden" name="id" value={q.id} />
                  <input type="hidden" name="status" value={s} />
                  <button
                    type="submit"
                    aria-pressed={q.status === s}
                    className={cx(
                      "mono rounded-[4px] border px-3 py-1.5 text-[0.78rem] capitalize",
                      q.status === s ? "border-ink bg-ink text-paper" : "border-rule-strong text-ink-2 hover:border-ink",
                    )}
                  >
                    {s}
                  </button>
                </form>
              ))}
            </div>
            <p className="mt-3">
              <StatusPill tone="muted">{q.status}</StatusPill>
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}
