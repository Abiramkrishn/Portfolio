import { describe, expect, it } from "vitest";
import { describeDiagram, layoutDiagram, pointAlong, routeAround, routeWire, toPath, truncate } from "./schematic";

const box = (x: number, y: number, w = 100, h = 40) => ({ x, y, w, h });

describe("routeWire", () => {
  it("leaves the right side and enters the left side when the target is to the right", () => {
    const pts = routeWire(box(0, 0), box(300, 100));
    expect(pts[0]).toEqual([100, 20]);
    expect(pts.at(-1)).toEqual([300, 120]);
    // turns in the first gap, not halfway
    expect(pts[1][0]).toBe(130);
  });

  it("routes leftwards from the source's left edge", () => {
    const pts = routeWire(box(300, 0), box(0, 100));
    expect(pts[0]).toEqual([300, 20]);
    expect(pts.at(-1)).toEqual([100, 120]);
  });

  it("joins vertically stacked boxes top to bottom", () => {
    const pts = routeWire(box(0, 0), box(0, 200));
    expect(pts[0]).toEqual([50, 40]);
    expect(pts.at(-1)).toEqual([50, 200]);
  });

  it("collapses straight runs without duplicate points", () => {
    const pts = routeWire(box(0, 0), box(300, 0));
    for (let i = 1; i < pts.length; i++) expect(pts[i]).not.toEqual(pts[i - 1]);
  });
});

describe("toPath / pointAlong", () => {
  it("produces a path that starts and ends on the polyline", () => {
    const d = toPath([[0, 0], [50, 0], [50, 50]]);
    expect(d.startsWith("M0 0")).toBe(true);
    expect(d.endsWith("L50 50")).toBe(true);
    expect(d).toContain("Q50 0");
  });

  it("finds the midpoint by length", () => {
    expect(pointAlong([[0, 0], [100, 0]], 0.5)).toEqual([50, 0]);
    expect(pointAlong([[0, 0], [50, 0], [50, 50]], 0.75)).toEqual([50, 25]);
  });
});

describe("routeAround", () => {
  it("moves the horizontal run off a node sitting between source and target", () => {
    const a = box(0, 100);
    const middle = box(200, 100);
    const b = box(400, 100);
    const pts = routeAround(a, b, [a, middle, b]);
    const crossesMiddle = pts.some(
      ([x, y], i) =>
        i > 0 &&
        y === pts[i - 1][1] &&
        Math.min(x, pts[i - 1][0]) < middle.x + middle.w &&
        Math.max(x, pts[i - 1][0]) > middle.x &&
        y >= middle.y &&
        y <= middle.y + middle.h,
    );
    expect(crossesMiddle).toBe(false);
    expect(pts[0]).toEqual([100, 120]);
    expect(pts.at(-1)).toEqual([400, 120]);
  });

  it("keeps the direct route when nothing is in the way", () => {
    expect(routeAround(box(0, 0), box(300, 100), [])).toEqual(routeWire(box(0, 0), box(300, 100)));
  });
});

describe("truncate", () => {
  it("cuts a polyline part-way along its length", () => {
    expect(truncate([[0, 0], [100, 0], [100, 100]], 0.75)).toEqual([[0, 0], [100, 0], [100, 50]]);
    expect(truncate([[0, 0], [10, 0]], 1)).toEqual([[0, 0], [10, 0]]);
  });
});

describe("layoutDiagram", () => {
  const diagram = {
    layers: ["In", "Core", "Data"],
    nodes: [
      { id: "a", label: "A", layer: 0 },
      { id: "b", label: "B", layer: 0 },
      { id: "c", label: "C", layer: 1 },
      { id: "d", label: "D", layer: 2 },
    ],
    edges: [
      { from: "a", to: "c" },
      { from: "b", to: "c" },
      { from: "c", to: "d", label: "writes" },
      { from: "c", to: "missing" },
    ],
  };

  it("places one column per layer and centres shorter columns", () => {
    const layout = layoutDiagram(diagram);
    expect(layout.columns).toHaveLength(3);
    const a = layout.nodes.find((n) => n.id === "a")!;
    const b = layout.nodes.find((n) => n.id === "b")!;
    const c = layout.nodes.find((n) => n.id === "c")!;
    expect(a.x).toBe(b.x);
    expect(c.x).toBeGreaterThan(a.x);
    expect(c.y + c.h / 2).toBeCloseTo((a.y + b.y + b.h) / 2);
  });

  it("drops edges that point at unknown nodes", () => {
    expect(layoutDiagram(diagram).edges).toHaveLength(3);
  });

  it("describes the diagram as an outline with outgoing connections", () => {
    const outline = describeDiagram(diagram);
    expect(outline.map((l) => l.label)).toEqual(["In", "Core", "Data"]);
    expect(outline[1].nodes[0].outgoing).toEqual([{ to: "D", label: "writes" }]);
  });
});
