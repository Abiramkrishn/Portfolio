import { lifecycle } from "@/content/site";
import { LIFECYCLE, type Coverage } from "@/lib/types";
import { cx } from "@/components/ui/primitives";

/**
 * The lifecycle strip: Problem · Architecture · Build · Integrate · Automate · Secure · Ship.
 * Filled cells are stages this piece of work covered. The same strip appears in the method,
 * on every project and in the hire flow, so the reader learns it once.
 */
export function CoverageStrip({
  coverage,
  size = "sm",
  showNotes = false,
  className,
}: {
  coverage: Coverage;
  size?: "sm" | "lg";
  showNotes?: boolean;
  className?: string;
}) {
  const covered = LIFECYCLE.filter((k) => k in coverage);
  if (covered.length === 0) return null;
  const summary = `Covered ${covered.length} of ${LIFECYCLE.length} stages: ${covered
    .map((k) => lifecycle[k].label)
    .join(", ")}`;

  if (size === "sm") {
    return (
      <div className={cx("flex items-center gap-2", className)}>
        <ol className="flex gap-[3px]" aria-label={summary}>
          {LIFECYCLE.map((k) => (
            <li
              key={k}
              title={lifecycle[k].label}
              className={cx(
                "h-2 w-3.5 rounded-[1px]",
                k in coverage ? "bg-signal" : "border border-rule-strong",
              )}
            >
              <span className="sr-only">{`${lifecycle[k].label}: ${k in coverage ? "covered" : "not covered"}`}</span>
            </li>
          ))}
        </ol>
        <span aria-hidden="true" className="label text-ink-3">
          {covered.length}/{LIFECYCLE.length}
        </span>
      </div>
    );
  }

  return (
    <div className={cx("@container", className)}>
      <p className="sr-only">{summary}</p>
      <ol className="grid grid-cols-7 gap-px overflow-hidden rounded-[4px] border border-rule bg-rule" aria-hidden={!showNotes}>
        {LIFECYCLE.map((k, i) => {
          const on = k in coverage;
          return (
            <li key={k} className={cx("relative flex min-h-12 min-w-0 flex-col justify-between p-2 @md:min-h-16 @2xl:p-3", on ? "bg-card" : "bg-paper")}>
              <span aria-hidden="true" className={cx("absolute inset-x-0 top-0 h-[3px]", on ? "bg-signal" : "bg-transparent")} />
              <span className="label text-ink-3">{String(i + 1).padStart(2, "0")}</span>
              <span className={cx("mt-2 text-[0.8rem] font-medium leading-tight @2xl:text-[0.85rem]", on ? "text-ink" : "text-ink-3")}>
                <span className="hidden @md:inline @2xl:hidden">{lifecycle[k].short}</span>
                <span className="hidden @2xl:inline">{lifecycle[k].label}</span>
              </span>
            </li>
          );
        })}
      </ol>
      {showNotes ? (
        <dl className="mt-4 grid gap-x-8 gap-y-2 sm:grid-cols-2">
          {covered
            .filter((k) => coverage[k])
            .map((k) => (
              <div key={k} className="flex gap-3 text-[0.9rem]">
                <dt className="label w-24 shrink-0 pt-0.5 text-signal-ink">{lifecycle[k].label}</dt>
                <dd className="text-ink-2">{coverage[k]}</dd>
              </div>
            ))}
        </dl>
      ) : null}
    </div>
  );
}
