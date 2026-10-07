import type { DiagramLayout } from "@/lib/schematic";

/**
 * Presentational SVG for a laid-out diagram. Pure (no hooks), so it renders on the server
 * for previews and inside the interactive client component for case studies.
 */
export function SchematicSvg({
  layout,
  selectedId,
  compact = false,
  idPrefix,
  className,
}: {
  layout: DiagramLayout;
  selectedId?: string | null;
  compact?: boolean;
  /** Unique per SVG on the page, so marker references never resolve to a hidden copy. */
  idPrefix: string;
  className?: string;
}) {
  const related = new Set<string>();
  if (selectedId) {
    for (const e of layout.edges) {
      if (e.from === selectedId) related.add(e.to);
      if (e.to === selectedId) related.add(e.from);
    }
  }
  const markerId = `${idPrefix.replace(/[^a-zA-Z0-9_-]/g, "")}-arrow`;

  return (
    <svg
      viewBox={`0 0 ${layout.width} ${layout.height}`}
      className={className ?? "mx-auto block h-auto w-full"}
      style={{ maxWidth: layout.width }}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <marker id={markerId} viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M0 0.5L7 4L0 7.5" fill="none" stroke="context-stroke" strokeWidth="1.2" />
        </marker>
      </defs>

      {!compact
        ? layout.columns.map((c, i) => (
            <g key={i}>
              <text x={c.x} y={20} fontSize={11} letterSpacing="0.08em" fill="var(--ink-3)" className="font-mono">
                {String(i + 1).padStart(2, "0")} · {c.label.toUpperCase()}
              </text>
              <line x1={c.x} x2={c.x + c.w} y1={28} y2={28} stroke="var(--rule)" strokeWidth={1} />
            </g>
          ))
        : null}

      {layout.edges.map((e) => {
        const hot = selectedId && (e.from === selectedId || e.to === selectedId);
        return (
          <g key={e.key}>
            <path
              d={e.d}
              fill="none"
              stroke={hot ? "var(--signal)" : "var(--ink-3)"}
              strokeOpacity={hot ? 1 : selectedId ? 0.35 : 0.7}
              strokeWidth={hot ? 1.75 : 1.25}
              strokeDasharray={e.dashed ? "5 4" : undefined}
              markerEnd={`url(#${markerId})`}
              style={{ transition: "stroke 0.25s, stroke-opacity 0.25s" }}
            />
            {e.label && !compact ? (
              <g transform={`translate(${e.mid[0]} ${e.mid[1]})`}>
                <rect
                  x={-(e.label.length * 3.6 + 8)}
                  y={-9}
                  width={e.label.length * 7.2 + 16}
                  height={18}
                  rx={3}
                  fill="var(--paper)"
                  stroke="var(--rule)"
                />
                <text textAnchor="middle" y={3.5} fontSize={10.5} fill="var(--ink-2)" className="font-mono">
                  {e.label}
                </text>
              </g>
            ) : null}
          </g>
        );
      })}

      {layout.nodes.map((n) => {
        const selected = n.id === selectedId;
        const dim = selectedId && !selected && !related.has(n.id);
        return (
          <g
            key={n.id}
            transform={`translate(${n.x} ${n.y})`}
            style={{ opacity: dim ? 0.45 : 1, transition: "opacity 0.25s" }}
          >
            <rect
              width={n.w}
              height={n.h}
              rx={5}
              fill="var(--card)"
              stroke={selected ? "var(--signal)" : "var(--ink-3)"}
              strokeWidth={selected ? 1.75 : 1}
            />
            <rect width={4} height={n.h} rx={1} fill={selected ? "var(--signal)" : "var(--rule-strong)"} />
            <text
              x={16}
              y={compact ? n.h / 2 + 6 : 26}
              fontSize={compact ? 17 : 15}
              fontWeight={560}
              fill="var(--ink)"
              className="font-sans"
            >
              {n.label}
            </text>
            {n.tech && !compact ? (
              <text x={16} y={45} fontSize={11.5} fill="var(--ink-3)" className="font-mono">
                {n.tech}
              </text>
            ) : null}
          </g>
        );
      })}
    </svg>
  );
}
