// Pure geometry for schematics: orthogonal wire routing and a layered layout for
// project diagrams. No DOM access, so it runs on the server and in tests.

import type { Diagram, DiagramEdge, DiagramNode } from "./types";

export type Box = { x: number; y: number; w: number; h: number };
export type Point = [number, number];

const round = (n: number) => Math.round(n * 10) / 10;

/**
 * Route a wire between two boxes with right-angled segments.
 * Going right or left, the wire leaves the source side, turns in the first gap (`gap` px
 * out), runs vertically to the target's centre line, then enters the target side. This keeps
 * long horizontal runs on the target's row instead of cutting through intermediate columns.
 * Boxes that overlap horizontally are joined top/bottom.
 */
export function routeWire(a: Box, b: Box, gap = 30): Point[] {
  const ay = a.y + a.h / 2;
  const by = b.y + b.h / 2;
  if (b.x >= a.x + a.w) {
    const sx = a.x + a.w;
    const mx = Math.min(sx + gap, (sx + b.x) / 2 + gap);
    return dedupe([[sx, ay], [mx, ay], [mx, by], [b.x, by]]);
  }
  if (b.x + b.w <= a.x) {
    const sx = a.x;
    const tx = b.x + b.w;
    const mx = Math.max(sx - gap, (sx + tx) / 2 - gap);
    return dedupe([[sx, ay], [mx, ay], [mx, by], [tx, by]]);
  }
  const ax = a.x + a.w / 2;
  const bx = b.x + b.w / 2;
  if (b.y >= a.y + a.h) {
    const my = (a.y + a.h + b.y) / 2;
    return dedupe([[ax, a.y + a.h], [ax, my], [bx, my], [bx, b.y]]);
  }
  const my = (b.y + b.h + a.y) / 2;
  return dedupe([[ax, a.y], [ax, my], [bx, my], [bx, b.y + b.h]]);
}

/**
 * Like routeWire, but if boxes sit between source and target, the horizontal run moves to
 * the nearest lane that clears all of them, so a wire never passes through a node.
 */
export function routeAround(a: Box, b: Box, obstacles: Box[], gap = 30, margin = 6): Point[] {
  const forward = b.x >= a.x + a.w;
  const backward = b.x + b.w <= a.x;
  if (!forward && !backward) return routeWire(a, b, gap);

  const lo = forward ? a.x + a.w : b.x + b.w;
  const hi = forward ? b.x : a.x;
  const between = obstacles.filter((o) => o !== a && o !== b && o.x >= lo && o.x + o.w <= hi);
  const sy = a.y + a.h / 2;
  const ty = b.y + b.h / 2;
  const clear = (y: number) => between.every((o) => y < o.y - margin || y > o.y + o.h + margin);
  if (between.length === 0 || clear(ty)) return routeWire(a, b, gap);

  const candidates = [sy, ty];
  for (const o of between) candidates.push(o.y - margin * 2, o.y + o.h + margin * 2);
  const lane = candidates
    .filter(clear)
    .sort((p, q) => Math.abs(p - sy) + Math.abs(p - ty) - (Math.abs(q - sy) + Math.abs(q - ty)))[0];
  if (lane === undefined) return routeWire(a, b, gap);

  const sx = forward ? a.x + a.w : a.x;
  const tx = forward ? b.x : b.x + b.w;
  const m1 = forward ? sx + gap : sx - gap;
  const m2 = forward ? tx - gap : tx + gap;
  return dedupe([[sx, sy], [m1, sy], [m1, lane], [m2, lane], [m2, ty], [tx, ty]]);
}

function dedupe(points: Point[]): Point[] {
  return points.filter(
    (p, i) => i === 0 || p[0] !== points[i - 1][0] || p[1] !== points[i - 1][1],
  );
}

/** Turn a polyline into an SVG path with softened corners. */
export function toPath(points: Point[], radius = 10): string {
  if (points.length < 2) return "";
  let d = `M${round(points[0][0])} ${round(points[0][1])}`;
  for (let i = 1; i < points.length - 1; i++) {
    const [px, py] = points[i - 1];
    const [cx, cy] = points[i];
    const [nx, ny] = points[i + 1];
    const inLen = Math.hypot(cx - px, cy - py);
    const outLen = Math.hypot(nx - cx, ny - cy);
    const r = Math.min(radius, inLen / 2, outLen / 2);
    const ix = cx - ((cx - px) / (inLen || 1)) * r;
    const iy = cy - ((cy - py) / (inLen || 1)) * r;
    const ox = cx + ((nx - cx) / (outLen || 1)) * r;
    const oy = cy + ((ny - cy) / (outLen || 1)) * r;
    d += ` L${round(ix)} ${round(iy)} Q${round(cx)} ${round(cy)} ${round(ox)} ${round(oy)}`;
  }
  const last = points[points.length - 1];
  return `${d} L${round(last[0])} ${round(last[1])}`;
}

/** Midpoint along a polyline, by length — used to place edge labels and stop markers. */
export function pointAlong(points: Point[], t = 0.5): Point {
  const lengths = points.slice(1).map((p, i) => Math.hypot(p[0] - points[i][0], p[1] - points[i][1]));
  const total = lengths.reduce((s, l) => s + l, 0);
  let target = total * t;
  for (let i = 0; i < lengths.length; i++) {
    if (target <= lengths[i]) {
      const k = lengths[i] === 0 ? 0 : target / lengths[i];
      return [
        points[i][0] + (points[i + 1][0] - points[i][0]) * k,
        points[i][1] + (points[i + 1][1] - points[i][1]) * k,
      ];
    }
    target -= lengths[i];
  }
  return points[points.length - 1];
}

/** The first `t` (0–1) of a polyline, by length — used to draw a wire that stops part-way. */
export function truncate(points: Point[], t: number): Point[] {
  if (t >= 1) return points;
  const lengths = points.slice(1).map((p, i) => Math.hypot(p[0] - points[i][0], p[1] - points[i][1]));
  let remaining = lengths.reduce((s, l) => s + l, 0) * Math.max(0, t);
  const out: Point[] = [points[0]];
  for (let i = 0; i < lengths.length; i++) {
    if (remaining >= lengths[i]) {
      out.push(points[i + 1]);
      remaining -= lengths[i];
      continue;
    }
    const k = lengths[i] === 0 ? 0 : remaining / lengths[i];
    out.push([
      points[i][0] + (points[i + 1][0] - points[i][0]) * k,
      points[i][1] + (points[i + 1][1] - points[i][1]) * k,
    ]);
    break;
  }
  return out;
}

export type LaidOutNode = DiagramNode & Box;
export type LaidOutEdge = DiagramEdge & { d: string; mid: Point; key: string };
export type DiagramLayout = {
  width: number;
  height: number;
  columns: { label: string; x: number; w: number }[];
  nodes: LaidOutNode[];
  edges: LaidOutEdge[];
};

export const DIAGRAM_METRICS = { nodeW: 184, nodeH: 62, gapX: 76, gapY: 22, pad: 20, header: 34 };

/** Lay a diagram out as columns, one per layer, nodes stacked and centred within each. */
export function layoutDiagram(diagram: Diagram): DiagramLayout {
  const { nodeW, nodeH, gapX, gapY, pad, header } = DIAGRAM_METRICS;
  const maxLayer = Math.max(diagram.layers.length - 1, ...diagram.nodes.map((n) => n.layer), 0);
  const layerCount = maxLayer + 1;
  const byLayer: DiagramNode[][] = Array.from({ length: layerCount }, () => []);
  for (const node of diagram.nodes) byLayer[Math.max(0, node.layer)].push(node);

  const tallest = Math.max(1, ...byLayer.map((l) => l.length));
  const bodyH = tallest * nodeH + (tallest - 1) * gapY;

  const nodes: LaidOutNode[] = [];
  byLayer.forEach((layerNodes, li) => {
    const colH = layerNodes.length * nodeH + Math.max(0, layerNodes.length - 1) * gapY;
    const top = pad + header + (bodyH - colH) / 2;
    layerNodes.forEach((n, ni) => {
      nodes.push({ ...n, x: pad + li * (nodeW + gapX), y: top + ni * (nodeH + gapY), w: nodeW, h: nodeH });
    });
  });

  const byId = new Map(nodes.map((n) => [n.id, n]));
  const edges: LaidOutEdge[] = [];
  diagram.edges.forEach((e, i) => {
    const a = byId.get(e.from);
    const b = byId.get(e.to);
    if (!a || !b || a === b) return;
    const pts = routeAround(a, b, nodes, gapX / 2);
    edges.push({ ...e, d: toPath(pts), mid: pointAlong(pts, 0.5), key: `${e.from}-${e.to}-${i}` });
  });

  return {
    width: pad * 2 + layerCount * nodeW + (layerCount - 1) * gapX,
    height: pad * 2 + header + bodyH,
    columns: Array.from({ length: layerCount }, (_, i) => ({
      label: diagram.layers[i] ?? "",
      x: pad + i * (nodeW + gapX),
      w: nodeW,
    })),
    nodes,
    edges,
  };
}

/** Plain-language outline of a diagram, for the list view and screen readers. */
export function describeDiagram(diagram: Diagram) {
  const byId = new Map(diagram.nodes.map((n) => [n.id, n]));
  return diagram.layers
    .map((label, li) => ({
      label: label || `Layer ${li + 1}`,
      nodes: diagram.nodes
        .filter((n) => n.layer === li)
        .map((n) => ({
          ...n,
          outgoing: diagram.edges
            .filter((e) => e.from === n.id && byId.has(e.to))
            .map((e) => ({ to: byId.get(e.to)!.label, label: e.label })),
        })),
    }))
    .filter((l) => l.nodes.length > 0);
}
