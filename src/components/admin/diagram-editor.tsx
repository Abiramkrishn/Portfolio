"use client";

import { useMemo } from "react";
import type { Diagram, DiagramEdge, DiagramNode } from "@/lib/types";
import { layoutDiagram } from "@/lib/schematic";
import { SchematicSvg } from "@/components/schematic/schematic-svg";
import { Checkbox, Repeater, TextArea, TextField } from "./fields";
import { inputClass } from "./ui";

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40) || "node";

/** Edit a system diagram as data — layers, components, connections — with a live preview. */
export function DiagramEditor({ value, onChange }: { value: Diagram; onChange: (d: Diagram) => void }) {
  const layout = useMemo(() => layoutDiagram(value), [value]);
  const set = (patch: Partial<Diagram>) => onChange({ ...value, ...patch });
  const ids = value.nodes.map((n) => n.id);
  const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);

  return (
    <div className="space-y-6">
      <div>
        <p className="label mb-2 text-ink-3">Live preview</p>
        {value.nodes.length > 0 ? (
          <div className="grid-paper overflow-x-auto rounded-[4px] border border-rule bg-paper p-3">
            <div className="min-w-[560px]">
              <SchematicSvg layout={layout} idPrefix="editor" />
            </div>
          </div>
        ) : (
          <p className="rounded-[4px] border border-dashed border-rule-strong p-6 text-center text-[0.9rem] text-ink-3">
            Add layers and components below. The diagram is hidden on the public page until it has components.
          </p>
        )}
        {dupes.length > 0 ? (
          <p className="mt-2 text-[0.85rem] text-signal-ink">Duplicate component ids: {[...new Set(dupes)].join(", ")}</p>
        ) : null}
      </div>

      <TextField label="Caption" value={value.caption ?? ""} onChange={(caption) => set({ caption })} maxLength={200} />

      <div>
        <p className="label mb-2 text-ink-3">Layers (columns, left to right)</p>
        <Repeater<string>
          items={value.layers}
          onChange={(layers) => set({ layers })}
          make={() => ""}
          addLabel="Add layer"
          itemLabel={(l, i) => l || `Layer ${i + 1}`}
          render={(layer, _u, i) => (
            <input
              aria-label={`Layer ${i + 1} name`}
              value={layer}
              onChange={(e) => set({ layers: value.layers.map((l, j) => (j === i ? e.target.value : l)) })}
              className={inputClass}
              placeholder="e.g. Channels, Core, Data"
            />
          )}
        />
      </div>

      <div>
        <p className="label mb-2 text-ink-3">Components</p>
        <Repeater<DiagramNode>
          items={value.nodes}
          onChange={(nodes) => set({ nodes })}
          make={() => ({ id: `node-${value.nodes.length + 1}`, label: "", layer: 0, tech: "", detail: "" })}
          addLabel="Add component"
          itemLabel={(n) => n.label || n.id}
          render={(n, update) => (
            <>
              <div className="grid gap-3 sm:grid-cols-[1fr_9rem_8rem]">
                <TextField
                  label="Label"
                  value={n.label}
                  onChange={(label) => update({ label, ...(n.id.startsWith("node-") ? { id: slugify(label) } : {}) })}
                />
                <TextField label="Id" value={n.id} onChange={(id) => update({ id: slugify(id) })} mono />
                <div>
                  <label className="label mb-1.5 block text-ink-3">
                    Layer
                    <select
                      value={n.layer}
                      onChange={(e) => update({ layer: Number(e.target.value) })}
                      className={`${inputClass} mt-1.5 normal-case tracking-normal`}
                    >
                      {(value.layers.length ? value.layers : ["Layer 1"]).map((l, i) => (
                        <option key={i} value={i}>
                          {i + 1}. {l || `Layer ${i + 1}`}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>
              <TextField label="Tech (short)" value={n.tech ?? ""} onChange={(tech) => update({ tech })} placeholder="e.g. Laravel · PHP" />
              <TextArea label="What it does" value={n.detail ?? ""} onChange={(detail) => update({ detail })} rows={2} />
            </>
          )}
        />
      </div>

      <div>
        <p className="label mb-2 text-ink-3">Connections</p>
        <Repeater<DiagramEdge>
          items={value.edges}
          onChange={(edges) => set({ edges })}
          make={() => ({ from: value.nodes[0]?.id ?? "", to: value.nodes[1]?.id ?? "", label: "" })}
          addLabel="Add connection"
          empty={value.nodes.length < 2 ? "Add at least two components first." : undefined}
          itemLabel={(e) => `${e.from || "?"} → ${e.to || "?"}`}
          render={(e, update) => (
            <div className="grid items-end gap-3 sm:grid-cols-[1fr_1fr_1fr_auto]">
              {(["from", "to"] as const).map((k) => (
                <label key={k} className="label block text-ink-3">
                  {k}
                  <select
                    value={e[k]}
                    onChange={(ev) => update({ [k]: ev.target.value } as Partial<DiagramEdge>)}
                    className={`${inputClass} mt-1.5 normal-case tracking-normal`}
                  >
                    <option value="">Choose…</option>
                    {value.nodes.map((n) => (
                      <option key={n.id} value={n.id}>
                        {n.label || n.id}
                      </option>
                    ))}
                  </select>
                </label>
              ))}
              <TextField label="Label" value={e.label ?? ""} onChange={(label) => update({ label })} maxLength={40} />
              <div className="pb-2">
                <Checkbox label="Dashed" checked={Boolean(e.dashed)} onChange={(dashed) => update({ dashed })} />
              </div>
            </div>
          )}
        />
      </div>
    </div>
  );
}
