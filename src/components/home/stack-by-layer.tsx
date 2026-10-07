import Link from "next/link";
import { LAYERS, SECURITY_BAND, type Tool } from "@/content/taxonomy";
import type { EvidenceRef } from "@/db/queries/public";
import { cx } from "@/components/ui/primitives";

/**
 * Capability, drawn as the layers of a system. No skill bars: depth is shown by where each
 * tool has actually been used. Security is a band across every layer, not a row.
 */
export function StackByLayer({
  evidence,
  headingId,
}: {
  evidence: Record<string, EvidenceRef[]>;
  headingId?: string;
}) {
  return (
    <div>
      <div className="grid gap-px overflow-hidden rounded-[4px] border border-rule bg-rule lg:grid-cols-[minmax(0,1fr)_17rem]">
        <ol className="grid gap-px bg-rule" aria-labelledby={headingId}>
          {LAYERS.map((layer, i) => (
            <li key={layer.key} className="grid gap-3 bg-paper p-4 md:grid-cols-[11rem_1fr] md:gap-6 md:p-5">
              <div>
                <p className="label text-signal-ink">L{String(i + 1).padStart(2, "0")}</p>
                <p className="mt-1 font-semibold text-ink">{layer.label}</p>
                <p className="text-[0.85rem] text-ink-3">{layer.role}</p>
              </div>
              <ToolList tools={layer.tools} evidence={evidence} />
            </li>
          ))}
        </ol>

        <div
          className="relative bg-paper p-4 md:p-5"
          style={{
            backgroundImage:
              "repeating-linear-gradient(135deg, var(--signal-soft) 0 1px, transparent 1px 9px)",
          }}
        >
          <div className="relative">
            <p className="label text-signal-ink">L× · Cross-cutting</p>
            <p className="mt-1 font-semibold text-ink">{SECURITY_BAND.label}</p>
            <p className="text-[0.85rem] text-ink-3">{SECURITY_BAND.role}</p>
            <div className="mt-4">
              <ToolList tools={SECURITY_BAND.tools} evidence={evidence} vertical />
            </div>
            <p className="mt-6 text-[0.85rem] leading-relaxed text-ink-2">
              Every layer on the left is also an attack surface. I test each one the way I&apos;d expect it to
              be attacked.
            </p>
          </div>
        </div>
      </div>
      <p className="label mt-3 text-ink-3">
        <span className="text-signal-ink">SYS / LOG</span> references link to the work where a tool was used.
      </p>
    </div>
  );
}

function ToolList({
  tools,
  evidence,
  vertical = false,
}: {
  tools: Tool[];
  evidence: Record<string, EvidenceRef[]>;
  vertical?: boolean;
}) {
  return (
    <ul className={cx(vertical ? "space-y-2" : "flex flex-wrap gap-x-2 gap-y-2")}>
      {tools.map((t) => {
        const refs = evidence[t.name] ?? [];
        return (
          <li
            key={t.name}
            className={cx(
              "inline-flex items-center gap-2 rounded-[3px] border bg-card py-1 pr-1.5 pl-2.5",
              refs.length > 0 ? "border-rule-strong" : "border-rule",
              vertical && "flex w-full justify-between",
            )}
          >
            <span className="text-[0.9rem] text-ink">{t.name}</span>
            {refs.length > 0 ? (
              <span className="flex gap-1">
                {refs.slice(0, 3).map((r) => (
                  <Link
                    key={r.code}
                    href={r.href}
                    title={r.title}
                    className="mono inline-flex min-h-6 items-center rounded-[2px] bg-signal-soft px-1.5 text-[0.68rem] text-signal-ink hover:bg-signal hover:text-white"
                  >
                    {r.code}
                  </Link>
                ))}
              </span>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
