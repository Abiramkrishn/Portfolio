"use client";

import { useId, useMemo, useState } from "react";
import { describeDiagram, layoutDiagram } from "@/lib/schematic";
import type { Diagram } from "@/lib/types";
import { useMediaQuery } from "@/components/hooks";
import { cx } from "@/components/ui/primitives";
import { DiagramIcon, ListIcon } from "@/components/ui/icons";
import { SchematicSvg } from "./schematic-svg";

/**
 * Interactive system diagram for a case study. Nodes are real buttons laid over the SVG,
 * so they take focus and work with a keyboard. The list view is the same information as an
 * outline — the default on small screens and the text alternative everywhere.
 */
export function Schematic({ diagram, figure }: { diagram: Diagram; figure: string }) {
  const layout = useMemo(() => layoutDiagram(diagram), [diagram]);
  const outline = useMemo(() => describeDiagram(diagram), [diagram]);
  const wide = useMediaQuery("(min-width: 768px)", false);
  const [choice, setChoice] = useState<"diagram" | "list" | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const uid = useId();
  const view = choice ?? (wide ? "diagram" : "list");
  const node = layout.nodes.find((n) => n.id === selected) ?? null;

  if (layout.nodes.length === 0) return null;

  return (
    <figure aria-labelledby={`${uid}-cap`}>
      <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
        <figcaption id={`${uid}-cap`} className="label text-ink-3">
          <span className="text-signal-ink">{figure}</span>
          {diagram.caption ? ` · ${diagram.caption}` : null}
        </figcaption>
        <div className="flex rounded-[4px] border border-rule-strong p-0.5" role="group" aria-label="View as">
          {(["diagram", "list"] as const).map((v) => (
            <button
              key={v}
              type="button"
              aria-pressed={view === v}
              onClick={() => setChoice(v)}
              className={cx(
                "mono inline-flex min-h-9 items-center gap-1.5 rounded-[3px] px-2.5 text-[0.75rem] capitalize transition-colors",
                view === v ? "bg-ink text-paper" : "text-ink-2 hover:text-ink",
              )}
            >
              {v === "diagram" ? <DiagramIcon /> : <ListIcon />}
              {v}
            </button>
          ))}
        </div>
      </div>

      {view === "diagram" ? (
        <div>
          <div className="-mx-4 overflow-x-auto px-4 md:mx-0 md:px-0">
            <div className="reg-marks grid-paper relative min-w-[680px] border border-rule bg-card/40 p-3 md:p-5">
              <div className="relative mx-auto" style={{ maxWidth: layout.width }}>
                <SchematicSvg layout={layout} selectedId={selected} idPrefix={uid} />
                {layout.nodes.map((n) => (
                  <button
                    key={n.id}
                    type="button"
                    aria-pressed={selected === n.id}
                    aria-controls={`${uid}-detail`}
                    onClick={() => setSelected((s) => (s === n.id ? null : n.id))}
                    className="absolute cursor-pointer rounded-[5px] focus-visible:outline-offset-2"
                    style={{
                      left: `${(n.x / layout.width) * 100}%`,
                      top: `${(n.y / layout.height) * 100}%`,
                      width: `${(n.w / layout.width) * 100}%`,
                      height: `${(n.h / layout.height) * 100}%`,
                    }}
                  >
                    <span className="sr-only">
                      {n.label}
                      {n.tech ? `, ${n.tech}` : ""}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div
            id={`${uid}-detail`}
            aria-live="polite"
            className="mt-3 min-h-[5.5rem] border-l-2 border-signal bg-card/60 px-4 py-3"
          >
            {node ? (
              <>
                <p className="label text-signal-ink">
                  {outline.find((l) => l.nodes.some((x) => x.id === node.id))?.label}
                </p>
                <p className="mt-1 font-medium text-ink">
                  {node.label}
                  {node.tech ? <span className="mono ml-2 text-ink-3">{node.tech}</span> : null}
                </p>
                {node.detail ? <p className="mt-1 max-w-2xl text-[0.95rem] text-ink-2">{node.detail}</p> : null}
              </>
            ) : (
              <p className="text-[0.95rem] text-ink-3">
                Select a component to see what it does and how it connects.
              </p>
            )}
          </div>
        </div>
      ) : (
        <ol className="divide-y divide-rule border-y border-rule">
          {outline.map((layer, li) => (
            <li key={li} className="grid gap-3 py-4 md:grid-cols-[10rem_1fr]">
              <p className="label pt-1 text-ink-3">
                <span className="text-signal-ink">{String(li + 1).padStart(2, "0")}</span> · {layer.label}
              </p>
              <ul className="space-y-3">
                {layer.nodes.map((n) => (
                  <li key={n.id}>
                    <p className="font-medium text-ink">
                      {n.label}
                      {n.tech ? <span className="mono ml-2 text-[0.8rem] font-normal text-ink-3">{n.tech}</span> : null}
                    </p>
                    {n.detail ? <p className="mt-0.5 text-[0.95rem] text-ink-2">{n.detail}</p> : null}
                    {n.outgoing.length > 0 ? (
                      <p className="mono mt-1 text-[0.78rem] text-ink-3">
                        {n.outgoing.map((o, i) => (
                          <span key={i} className="mr-3 inline-block">
                            → {o.to}
                            {o.label ? ` (${o.label})` : ""}
                          </span>
                        ))}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      )}
    </figure>
  );
}
