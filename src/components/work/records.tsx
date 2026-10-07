import type { Challenge, Decision } from "@/lib/types";
import { ArrowRight } from "@/components/ui/icons";

/** Architecture decision records: context → decision → trade-off. */
export function DecisionRecords({ decisions }: { decisions: Decision[] }) {
  return (
    <ol className="space-y-4">
      {decisions.map((d, i) => (
        <li key={i} className="border border-rule bg-card/50">
          <div className="flex items-baseline gap-4 border-b border-rule px-5 py-4">
            <span className="label shrink-0 text-signal-ink">ADR-{String(i + 1).padStart(2, "0")}</span>
            <h3 className="text-[1.1rem] font-semibold tracking-[-0.01em] text-ink">{d.title}</h3>
          </div>
          <dl className="grid gap-px bg-rule md:grid-cols-3">
            {(
              [
                ["Context", d.context, "text-ink-2"],
                ["Decision", d.decision, "text-ink"],
                ["Trade-off", d.tradeoff, "text-ink-2"],
              ] as const
            )
              .filter(([, v]) => v)
              .map(([k, v, tone]) => (
                <div key={k} className="bg-paper px-5 py-4">
                  <dt className="label text-ink-3">{k}</dt>
                  <dd className={`mt-1.5 text-[0.95rem] leading-relaxed ${tone}`}>{v}</dd>
                </div>
              ))}
          </dl>
        </li>
      ))}
    </ol>
  );
}

/** Debugging stories: symptom → investigation → resolution. */
export function FieldNotes({ challenges }: { challenges: Challenge[] }) {
  return (
    <ol className="space-y-8">
      {challenges.map((c, i) => (
        <li key={i}>
          <h3 className="flex items-baseline gap-3 text-[1.1rem] font-semibold text-ink">
            <span className="label text-signal-ink">FN-{String(i + 1).padStart(2, "0")}</span>
            {c.title}
          </h3>
          <ol className="mt-4 grid gap-4 md:grid-cols-3 md:gap-8">
            {(
              [
                ["Symptom", c.symptom],
                ["Investigation", c.investigation],
                ["Resolution", c.resolution],
              ] as const
            ).map(([k, v], j) => (
              <li key={k} className={`relative border-t-2 pt-3 ${j === 0 ? "border-signal" : "border-rule-strong"}`}>
                {j > 0 ? (
                  <span aria-hidden="true" className="absolute top-3 -left-6 hidden text-ink-3 md:block">
                    <ArrowRight size={14} />
                  </span>
                ) : null}
                <p className="label text-ink-3">{k}</p>
                <p className="mt-1.5 text-[0.95rem] leading-relaxed text-ink-2">{v || "Not recorded"}</p>
              </li>
            ))}
          </ol>
        </li>
      ))}
    </ol>
  );
}
