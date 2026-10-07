import Link from "next/link";
import type { PublicLog } from "@/db/queries/public";
import type { LogKind } from "@/lib/types";
import { cx } from "@/components/ui/primitives";

export const KIND_LABEL: Record<LogKind, string> = {
  build_log: "Build log",
  security: "Security",
  experiment: "Experiment",
  note: "Note",
};

export function formatDate(d: Date | string | null) {
  if (!d) return "";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("en-GB", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" });
}

export function LogList({ entries, headingLevel = 3 }: { entries: PublicLog[]; headingLevel?: 2 | 3 }) {
  const H = `h${headingLevel}` as const;
  return (
    <ol className="border-t border-rule">
      {entries.map((e) => (
        <li key={e.id} className="border-b border-rule">
          <Link
            href={`/lab/${e.slug}`}
            className="group grid grid-cols-[4.5rem_1fr] gap-x-3 gap-y-1 py-5 md:grid-cols-[5.5rem_8rem_1fr_7rem] md:gap-x-6"
          >
            <span className="label pt-1 text-signal-ink">{e.code}</span>
            <span className={cx("label pt-1 text-ink-3", "hidden md:block")}>{KIND_LABEL[e.kind]}</span>
            <span className="min-w-0">
              <H className="font-medium text-ink transition-colors group-hover:text-signal-ink">
                {e.title}
                {e.visibility === "draft" ? <span className="label ml-2 text-signal-ink">Draft</span> : null}
              </H>
              {e.summary ? <span className="mt-1 block text-[0.92rem] text-ink-2">{e.summary}</span> : null}
              <span className="label mt-2 block text-ink-3 md:hidden">
                {KIND_LABEL[e.kind]}
                {e.publishedAt ? ` · ${formatDate(e.publishedAt)}` : ""}
              </span>
            </span>
            <span className="mono hidden pt-0.5 text-right text-[0.78rem] text-ink-3 md:block">
              {e.publishedAt ? (
                <time dateTime={new Date(e.publishedAt).toISOString()}>{formatDate(e.publishedAt)}</time>
              ) : null}
            </span>
          </Link>
        </li>
      ))}
    </ol>
  );
}
