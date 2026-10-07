import { lifecycle, principles } from "@/content/site";
import { LIFECYCLE } from "@/lib/types";

/**
 * The seven-stage path, drawn as a wire with a node per stage. Vertical until xl, where the seven
 * stages have room to run horizontally; from md each vertical step puts its label beside its text.
 */
export function Method() {
  return (
    <div>
      <ol className="relative grid gap-0 xl:grid-cols-7 xl:gap-px">
        {LIFECYCLE.map((key, i) => {
          const stage = lifecycle[key];
          const isSecure = key === "secure";
          return (
            <li key={key} className="relative pb-8 pl-8 last:pb-0 xl:pb-0 xl:pl-0">
              {/* wire */}
              <span
                aria-hidden="true"
                className={`absolute top-2 bottom-0 left-[5px] w-px bg-rule-strong xl:top-[5px] xl:right-0 xl:bottom-auto xl:left-0 xl:h-px xl:w-auto ${i === LIFECYCLE.length - 1 ? "hidden xl:block" : ""}`}
              />
              {/* node */}
              <span
                aria-hidden="true"
                className={
                  isSecure
                    ? "absolute top-1 left-0 size-[11px] rotate-45 border-2 border-signal bg-paper xl:top-0"
                    : "absolute top-1 left-0 size-[11px] rounded-full border-2 border-ink bg-paper xl:top-0"
                }
              />
              <div className="md:grid md:grid-cols-[10rem_minmax(0,1fr)] md:gap-x-6 xl:block xl:pt-8 xl:pr-4">
                <div>
                  <p className="label text-signal-ink">{String(i + 1).padStart(2, "0")}</p>
                  <h3 className="mt-1 text-[1.1rem] font-semibold tracking-[-0.01em] text-ink xl:text-[1rem] 2xl:text-[1.1rem]">
                    {stage.label}
                  </h3>
                </div>
                <div className="max-w-2xl">
                  <p className="mt-2 text-[0.92rem] leading-relaxed text-ink-2 md:mt-0 xl:mt-2">{stage.what}</p>
                  <p className="mono mt-3 text-[0.75rem] leading-snug text-ink-3">→ {stage.deliverable}</p>
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      <div className="mt-16 grid gap-px overflow-hidden rounded-[4px] border border-rule bg-rule md:grid-cols-2">
        {principles.map((p, i) => (
          <div key={p.title} className="bg-paper p-6">
            <p className="label text-ink-3">Principle {String(i + 1).padStart(2, "0")}</p>
            <h3 className="mt-2 text-[1.15rem] font-semibold tracking-[-0.01em] text-ink">{p.title}</h3>
            <p className="mt-2 text-[0.95rem] leading-relaxed text-ink-2">{p.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
