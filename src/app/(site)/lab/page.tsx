import type { Metadata } from "next";
import Link from "next/link";
import { getLogEntries } from "@/db/queries/public";
import { LogList } from "@/components/lab/log-list";
import { SectionMark } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "Lab: build logs, security work and experiments",
  description:
    "Working notes from Abiram Krishn: build logs, security assessments, experiments with AI models and technical notes.",
  alternates: { canonical: "/lab" },
};

export default async function LabPage() {
  const entries = await getLogEntries();

  return (
    <div className="container-page pt-12 pb-20 md:pt-20 md:pb-28">
      <SectionMark n="L" label="Lab" />
      <h1 className="display mt-6 max-w-5xl">The working notes.</h1>
      <p className="lede mt-6 max-w-2xl">
        Build logs, security work, experiments and technical notes: the thinking behind finished systems, written
        while it happens.
      </p>
      <p className="mt-4 text-[0.9rem] text-ink-3">
        Follow along with the{" "}
        <Link href="/feed.xml" className="link-underline text-ink-2">
          RSS feed
        </Link>
        .
      </p>

      <div className="mt-14">
        {entries.length > 0 ? (
          <LogList entries={entries} headingLevel={2} />
        ) : (
          <div className="reg-marks grid-paper border border-rule px-6 py-16 text-center">
            <p className="label text-signal-ink">LOG-000</p>
            <p className="title mt-3">The first entries are being written.</p>
            <p className="mx-auto mt-3 max-w-md text-[0.95rem] text-ink-2">
              Until then, the system files show the work itself.
            </p>
            <Link href="/work" className="link-underline mt-5 inline-flex min-h-10 items-center text-ink">
              Open the system register
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
