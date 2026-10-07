import Link from "next/link";
import { problems, site } from "@/content/site";
import { canonicalTool } from "@/content/taxonomy";
import type { EvidenceRef } from "@/db/queries/public";
import { Section } from "@/components/ui/primitives";
import { ArrowRight, Plus } from "@/components/ui/icons";

export function ProblemIndex({ n, evidence }: { n: string; evidence: Record<string, EvidenceRef[]> }) {
  return (
    <Section id="problems" n={n} label="Problems I take on">
      <h2 id="problems-title" className="headline max-w-3xl">
        {site.seams.lead}
      </h2>
      <p className="lede mt-6 max-w-3xl">{site.seams.body}</p>

      <ol className="mt-12 border-t border-rule">
        {problems.map((p, i) => {
          const proof = dedupe(p.tools.flatMap((t) => evidence[canonicalTool(t) ?? t] ?? [])).slice(0, 3);
          return (
            <li key={p.id} className="border-b border-rule">
              <details className="disclosure group" name="problems">
                <summary className="grid grid-cols-[2.25rem_1fr_auto] items-start gap-3 py-5 md:grid-cols-[3rem_1fr_auto] md:py-6">
                  <span className="label pt-1.5 text-signal-ink">{String(i + 1).padStart(2, "0")}</span>
                  <span className="title transition-colors group-hover:text-signal-ink">{p.title}</span>
                  <span className="disclosure-icon mt-1 inline-flex size-7 items-center justify-center rounded-full border border-rule-strong text-ink-2">
                    <Plus size={14} />
                    <span className="sr-only">Show details</span>
                  </span>
                </summary>
                <div className="grid gap-8 pb-8 pl-[2.25rem] md:grid-cols-2 md:pl-[3rem] md:pr-10">
                  <div>
                    <p className="text-[1rem] leading-relaxed text-ink-2">{p.lede}</p>
                    <Link
                      href={`/hire?type=${p.engagement}`}
                      className="mt-4 inline-flex min-h-10 items-center gap-2 text-[0.95rem] font-medium text-ink hover:text-signal-ink"
                    >
                      Have this problem? <ArrowRight />
                    </Link>
                  </div>
                  <div className="space-y-5">
                    <div>
                      <p className="label text-ink-3">What I&apos;d do</p>
                      <ul className="mt-2 space-y-1.5">
                        {p.approach.map((a) => (
                          <li key={a} className="flex gap-2.5 text-[0.95rem] text-ink">
                            <span aria-hidden="true" className="mt-[0.7em] h-px w-2.5 shrink-0 bg-signal" />
                            {a}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="label text-ink-3">Tools</p>
                      <p className="mono mt-2 text-ink-2">{p.tools.join(" · ")}</p>
                    </div>
                    {proof.length > 0 ? (
                      <div>
                        <p className="label text-ink-3">Proof</p>
                        <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                          {proof.map((r) => (
                            <li key={r.code}>
                              <Link href={r.href} className="mono inline-flex min-h-8 items-center gap-1.5 text-[0.85rem] text-ink hover:text-signal-ink">
                                <span className="text-signal-ink">{r.code}</span> {r.title} →
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </div>
                </div>
              </details>
            </li>
          );
        })}
      </ol>
    </Section>
  );
}

function dedupe(refs: EvidenceRef[]) {
  const seen = new Set<string>();
  return refs.filter((r) => (seen.has(r.code) ? false : (seen.add(r.code), true)));
}
