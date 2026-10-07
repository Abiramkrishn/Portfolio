import Link from "next/link";
import { ENGAGEMENT_KEYS, engagements } from "@/content/site";
import { ArrowRight } from "@/components/ui/icons";

/**
 * Ways to start, as a register: what it is, the first concrete step, and a deep link to the
 * brief. Text stacks in one column until there's room (xl) for separate summary and first-step columns.
 */
export function Engagements() {
  return (
    <ol className="border-t border-rule">
      {ENGAGEMENT_KEYS.map((key, i) => {
        const e = engagements[key];
        return (
          <li key={key} className="border-b border-rule">
            <Link
              href={`/hire?type=${key}`}
              className="group grid grid-cols-[2.25rem_minmax(0,1fr)_2.25rem] items-start gap-x-3 py-5 md:grid-cols-[3rem_minmax(0,1fr)_2.25rem] md:gap-x-6 xl:grid-cols-[3rem_12rem_minmax(0,1fr)_15rem_2.25rem]"
            >
              <span className="label pt-1.5 text-signal-ink">{String(i + 1).padStart(2, "0")}</span>
              <span className="min-w-0 xl:contents">
                <span className="title block transition-colors group-hover:text-signal-ink">{e.label}</span>
                <span className="mt-1.5 block max-w-2xl text-[0.95rem] leading-relaxed text-ink-2 xl:mt-0 xl:pt-1">
                  {e.summary}
                </span>
                <span className="mt-3 block xl:mt-0 xl:pt-1">
                  <span className="label block text-ink-3">First step</span>
                  <span className="mt-0.5 block text-[0.9rem] text-ink">{e.firstStep}</span>
                </span>
              </span>
              <span className="inline-flex size-9 items-center justify-center rounded-full border border-rule-strong text-ink transition-colors group-hover:border-ink group-hover:bg-ink group-hover:text-paper">
                <ArrowRight />
                <span className="sr-only">Start with {e.label}</span>
              </span>
            </Link>
          </li>
        );
      })}
    </ol>
  );
}
