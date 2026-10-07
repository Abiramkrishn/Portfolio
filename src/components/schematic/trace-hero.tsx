"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import {
  MAP_SIZE,
  NODE_SIZE,
  PERIMETER,
  RAIL_Y,
  mapNodes,
  mapWires,
  traces,
  type MapNode,
  type TraceStep,
} from "@/content/traces";
import { pointAlong, routeWire, toPath, truncate, type Point } from "@/lib/schematic";
import { useReducedMotion } from "@/components/hooks";
import { cx } from "@/components/ui/primitives";
import { Pause, Play, Replay, StepBack, StepForward } from "@/components/ui/icons";

// ─── Static geometry (computed once) ────────────────────────────────────────

const nodeById = new Map(mapNodes.map((n) => [n.id, n]));
const box = (n: MapNode) => ({ x: n.x, y: n.y, w: NODE_SIZE.w, h: NODE_SIZE.h });

function wirePoints(from: string, to: string): Point[] {
  return routeWire(box(nodeById.get(from)!), box(nodeById.get(to)!), 30);
}

const baseWires = mapWires.map(([a, b]) => ({ key: `${a}>${b}`, d: toPath(wirePoints(a, b)) }));

const BLOCK_AT = 0.56;
const STEP_MS = 3400;
const DRAW_MS = 1000;

const hopGeometry = (step: TraceStep) => {
  if (!step.from || !step.to) return null;
  const pts = wirePoints(step.from, step.to);
  const shown = step.blocked ? truncate(pts, BLOCK_AT) : pts;
  return {
    full: toPath(pts),
    shown: toPath(shown),
    stop: pointAlong(pts, step.blocked ? BLOCK_AT : 1),
  };
};

const geometryByTrace = Object.fromEntries(traces.map((t) => [t.id, t.steps.map(hopGeometry)]));

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

// ─── Component ──────────────────────────────────────────────────────────────

export function TraceHero() {
  const reduced = useReducedMotion();
  const [traceId, setTraceId] = useState(traces[0].id);
  const [stepIndex, setStepIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const figureRef = useRef<HTMLElement>(null);
  const autoplayed = useRef(false);
  const uid = useId();

  const trace = traces.find((t) => t.id === traceId)!;
  const step = trace.steps[stepIndex];
  const geometry = geometryByTrace[trace.id];

  // Start the first trace once, when the figure first comes into view.
  useEffect(() => {
    const el = figureRef.current;
    if (!el || reduced) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !autoplayed.current) {
          autoplayed.current = true;
          setPlaying(true);
          io.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduced]);

  // Advance while playing; stop at the end rather than looping.
  useEffect(() => {
    if (!playing) return;
    const id = window.setTimeout(() => {
      if (stepIndex < trace.steps.length - 1) setStepIndex((i) => i + 1);
      else setPlaying(false);
    }, reduced ? STEP_MS - 800 : STEP_MS);
    return () => window.clearTimeout(id);
  }, [playing, stepIndex, trace.steps.length, reduced]);

  const selectTrace = useCallback(
    (id: string) => {
      autoplayed.current = true;
      setTraceId(id);
      setStepIndex(0);
      setPlaying(!reduced);
    },
    [reduced],
  );

  const goTo = (i: number) => {
    setPlaying(false);
    setStepIndex(Math.max(0, Math.min(trace.steps.length - 1, i)));
  };

  const atEnd = stepIndex === trace.steps.length - 1;

  // Which nodes are lit.
  const inTrace = new Set(trace.steps.flatMap((s) => [s.from, s.to]).filter(Boolean) as string[]);
  const touched = new Set(
    trace.steps.slice(0, stepIndex + 1).flatMap((s) => [s.from, s.to]).filter(Boolean) as string[],
  );
  const current = new Set([step.from, step.to].filter(Boolean) as string[]);
  const isAttack = trace.id === "attack";
  const boundaryStep = !step.from && isAttack;

  return (
    <figure ref={figureRef} aria-labelledby={`${uid}-cap`} className="mt-14 md:mt-20">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <figcaption id={`${uid}-cap`} className="max-w-xl">
          <p className="label text-ink-3">
            <span className="text-signal-ink">Fig. 1</span> · Trace a request
          </p>
          <p className="mt-2 text-[0.95rem] text-ink-2">
            How a request moves through the kind of systems I build, and how I attack them. Pick a trace.
          </p>
        </figcaption>

        <fieldset className="-mx-4 min-w-0 px-4 lg:mx-0 lg:px-0">
          <legend className="sr-only">Choose a trace</legend>
          <div className="flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none]">
            {traces.map((t) => (
              <label
                key={t.id}
                className={cx(
                  "mono relative shrink-0 cursor-pointer select-none rounded-[4px] border px-3 py-2 text-[0.8rem] transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-signal",
                  t.id === traceId
                    ? t.id === "attack"
                      ? "border-signal bg-signal text-white"
                      : "border-ink bg-ink text-paper"
                    : "border-rule-strong text-ink-2 hover:border-ink hover:text-ink",
                )}
              >
                <input
                  type="radio"
                  name={`${uid}-trace`}
                  value={t.id}
                  checked={t.id === traceId}
                  onChange={() => selectTrace(t.id)}
                  className="sr-only"
                />
                {t.label}
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      {/* ── Desktop: the full system map ───────────────────────────────── */}
      <div className="reg-marks grid-paper relative mt-5 hidden border border-rule bg-card/40 lg:block">
        <svg
          viewBox={`0 0 ${MAP_SIZE.width} ${MAP_SIZE.height}`}
          className="block h-auto w-full"
          aria-hidden="true"
        >
          {/* security boundary */}
          <rect
            x={PERIMETER.x}
            y={PERIMETER.y}
            width={PERIMETER.w}
            height={PERIMETER.h}
            rx={10}
            fill={boundaryStep ? "var(--signal-soft)" : "none"}
            stroke={isAttack ? "var(--signal)" : "var(--rule-strong)"}
            strokeWidth={isAttack ? 1.5 : 1}
            strokeDasharray="6 6"
            style={{ transition: "stroke 0.4s, fill 0.4s" }}
          />
          <text
            x={PERIMETER.x + 14}
            y={PERIMETER.y + 22}
            className="font-mono"
            fontSize={11}
            letterSpacing="0.08em"
            fill={isAttack ? "var(--signal-ink)" : "var(--ink-3)"}
          >
            SECURITY BOUNDARY · AUTHN · AUTHZ · VALIDATION · SECRETS
          </text>

          {/* infrastructure rail */}
          <line x1={24} x2={MAP_SIZE.width - 24} y1={RAIL_Y} y2={RAIL_Y} stroke="var(--ink-3)" strokeWidth={1} />
          {Array.from({ length: 24 }, (_, i) => (
            <line
              key={i}
              x1={24 + i * 50}
              x2={24 + i * 50}
              y1={RAIL_Y}
              y2={RAIL_Y + (i % 4 === 0 ? 8 : 4)}
              stroke="var(--ink-3)"
              strokeWidth={1}
            />
          ))}
          <text x={24} y={RAIL_Y - 10} className="font-mono" fontSize={11} letterSpacing="0.08em" fill="var(--ink-3)">
            LINUX · VPS · CLOUD · WHERE ALL OF IT RUNS
          </text>

          {/* resting wires */}
          {baseWires.map((w) => (
            <path key={w.key} d={w.d} fill="none" stroke="var(--rule-strong)" strokeWidth={1.25} />
          ))}

          {/* completed hops */}
          {trace.steps.slice(0, stepIndex).map((s, i) => {
            const g = geometry[i];
            if (!g) return null;
            return (
              <g key={`${trace.id}-done-${i}`}>
                <path d={g.shown} fill="none" stroke="var(--signal-wire)" strokeWidth={1.75} />
                {s.blocked ? <BlockMark at={g.stop} /> : null}
              </g>
            );
          })}

          {/* current hop */}
          {geometry[stepIndex] ? (
            <ActiveHop
              key={`${trace.id}-${stepIndex}`}
              d={geometry[stepIndex]!.full}
              stopAt={step.blocked ? BLOCK_AT : 1}
              blocked={Boolean(step.blocked)}
              stop={geometry[stepIndex]!.stop}
              animate={!reduced}
            />
          ) : null}

          {/* nodes */}
          {mapNodes.map((n) => {
            if (n.ghost && !inTrace.has(n.id)) return null;
            const state = current.has(n.id)
              ? "current"
              : touched.has(n.id)
                ? "touched"
                : inTrace.has(n.id)
                  ? "upcoming"
                  : "idle";
            return <MapNodeBox key={n.id} node={n} state={state} hostile={n.id === "adversary"} />;
          })}
        </svg>
      </div>

      {/* ── Caption log (desktop) ──────────────────────────────────────── */}
      <div className="mt-4 hidden items-start gap-8 lg:grid lg:grid-cols-[auto_1fr_auto]">
        <Controls
          playing={playing}
          atStart={stepIndex === 0}
          atEnd={atEnd}
          onPlay={() => {
            if (atEnd) setStepIndex(0);
            setPlaying((p) => !p || atEnd);
          }}
          onPrev={() => goTo(stepIndex - 1)}
          onNext={() => goTo(stepIndex + 1)}
          onReplay={() => {
            setStepIndex(0);
            setPlaying(!reduced);
          }}
        />
        <div aria-live="polite" className="min-h-[4.5rem]">
          <p className="label text-ink-3">
            {trace.intent} · step {String(stepIndex + 1).padStart(2, "0")} /{" "}
            {String(trace.steps.length).padStart(2, "0")}
          </p>
          <p className="mt-1.5 max-w-3xl text-[1.05rem] leading-snug text-ink">{step.caption}</p>
        </div>
        <ul className="flex max-w-xs flex-wrap justify-end gap-1.5" aria-label="Tools at this step">
          {step.tools.map((t) => (
            <li key={t} className="mono rounded-[3px] border border-signal/40 bg-signal-soft px-2 py-0.5 text-[0.75rem] text-signal-ink">
              {t}
            </li>
          ))}
        </ul>
      </div>
      <ol className="mt-4 hidden gap-1 lg:flex" aria-label="Steps">
        {trace.steps.map((s, i) => (
          <li key={i} className="flex-1">
            <button
              type="button"
              onClick={() => goTo(i)}
              aria-current={i === stepIndex ? "step" : undefined}
              aria-label={`Step ${i + 1}: ${s.caption}`}
              className="group block w-full py-2 text-left"
            >
              <span
                className={cx(
                  "block h-[3px] rounded-full transition-colors",
                  i < stepIndex ? "bg-signal" : i === stepIndex ? "bg-ink" : "bg-rule group-hover:bg-rule-strong",
                )}
              />
              <span className={cx("label mt-1.5 block", i === stepIndex ? "text-ink" : "text-ink-3")}>
                {String(i + 1).padStart(2, "0")}
              </span>
            </button>
          </li>
        ))}
      </ol>

      {/* ── Mobile / tablet: the same trace as a vertical pipeline ─────── */}
      <div className="mt-5 lg:hidden">
        <p className="label text-ink-3">{trace.intent}</p>
        <ol className="mt-4" aria-label={`${trace.label}: steps`}>
          {trace.steps.map((s, i) => {
            const from = s.from ? nodeById.get(s.from) : null;
            const to = s.to ? nodeById.get(s.to) : null;
            const done = i < stepIndex;
            const active = i === stepIndex;
            return (
              <li key={`${trace.id}-${i}`} className="relative pb-5 pl-7 last:pb-0">
                <span
                  aria-hidden="true"
                  className={cx(
                    "absolute top-3 bottom-0 left-[5px] w-px transition-colors duration-500",
                    i === trace.steps.length - 1 ? "hidden" : done ? "bg-signal" : "bg-rule-strong",
                  )}
                />
                <span
                  aria-hidden="true"
                  className={cx(
                    "absolute top-1.5 left-0 size-[11px] rounded-full border-2 transition-colors duration-300",
                    s.blocked && (done || active)
                      ? "border-signal bg-paper"
                      : done || active
                        ? "border-signal bg-signal"
                        : "border-rule-strong bg-paper",
                  )}
                />
                <button
                  type="button"
                  onClick={() => goTo(i)}
                  aria-current={active ? "step" : undefined}
                  className="block w-full text-left"
                >
                  <span className="label flex flex-wrap items-center gap-x-1.5 text-ink-3">
                    <span className="text-signal-ink">{String(i + 1).padStart(2, "0")}</span>
                    {from && to ? (
                      <>
                        <span>{from.label}</span>
                        <span aria-hidden="true">→</span>
                        <span>{to.label}</span>
                        {s.blocked ? <span className="text-signal-ink">· denied</span> : null}
                      </>
                    ) : (
                      <span>Report</span>
                    )}
                  </span>
                  <span className={cx("mt-1 block text-[0.98rem] leading-snug", active ? "text-ink" : done ? "text-ink-2" : "text-ink-3")}>
                    {s.caption}
                  </span>
                </button>
                {active ? (
                  <ul className="mt-2 flex flex-wrap gap-1.5" aria-label="Tools at this step">
                    {s.tools.map((t) => (
                      <li key={t} className="mono rounded-[3px] border border-signal/40 bg-signal-soft px-2 py-0.5 text-[0.72rem] text-signal-ink">
                        {t}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            );
          })}
        </ol>
        <div className="mt-5">
          <Controls
            playing={playing}
            atStart={stepIndex === 0}
            atEnd={atEnd}
            onPlay={() => {
              if (atEnd) setStepIndex(0);
              setPlaying((p) => !p || atEnd);
            }}
            onPrev={() => goTo(stepIndex - 1)}
            onNext={() => goTo(stepIndex + 1)}
            onReplay={() => {
              setStepIndex(0);
              setPlaying(!reduced);
            }}
          />
        </div>
      </div>

      <p className="mt-6 border-t border-rule pt-4 text-[0.95rem] text-ink-2">
        Every node on this map is a layer I&apos;ve designed, built, integrated or audited.
      </p>
    </figure>
  );
}

// ─── Pieces ─────────────────────────────────────────────────────────────────

function MapNodeBox({
  node,
  state,
  hostile,
}: {
  node: MapNode;
  state: "current" | "touched" | "upcoming" | "idle";
  hostile: boolean;
}) {
  const { w, h } = NODE_SIZE;
  const lit = state === "current" || state === "touched";
  return (
    <g
      transform={`translate(${node.x} ${node.y})`}
      style={{ opacity: state === "idle" ? 0.5 : 1, transition: "opacity 0.4s" }}
    >
      <rect
        width={w}
        height={h}
        rx={5}
        fill="var(--card)"
        stroke={state === "current" ? "var(--signal)" : lit ? "var(--ink)" : "var(--rule-strong)"}
        strokeWidth={state === "current" ? 1.75 : 1}
        strokeDasharray={hostile ? "4 3" : undefined}
        style={{ transition: "stroke 0.3s" }}
      />
      <rect x={0} y={0} width={4} height={h} rx={1} fill={lit ? "var(--signal)" : "transparent"} />
      <text x={16} y={25} fontSize={15} fontWeight={560} fill="var(--ink)" className="font-sans">
        {node.label}
      </text>
      <text x={16} y={44} fontSize={11} fill="var(--ink-3)" className="font-mono">
        {node.tech}
      </text>
    </g>
  );
}

function BlockMark({ at }: { at: Point }) {
  const [x, y] = at;
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r={11} fill="var(--card)" stroke="var(--signal)" strokeWidth={1.5} />
      <path d="M-4 -4L4 4M4 -4L-4 4" stroke="var(--signal)" strokeWidth={1.75} strokeLinecap="round" />
      <rect x={-74} y={-9} width={56} height={18} rx={3} fill="var(--card)" stroke="var(--signal)" strokeWidth={1} />
      <text x={-46} y={4} textAnchor="middle" fontSize={10.5} letterSpacing="0.08em" fill="var(--signal-ink)" className="font-mono">
        DENIED
      </text>
    </g>
  );
}

/** One hop: the wire draws itself while a packet travels along it. */
function ActiveHop({
  d,
  stopAt,
  blocked,
  stop,
  animate,
}: {
  d: string;
  stopAt: number;
  blocked: boolean;
  stop: Point;
  animate: boolean;
}) {
  const pathRef = useRef<SVGPathElement>(null);
  const packetRef = useRef<SVGCircleElement>(null);
  const [arrived, setArrived] = useState(!animate);

  useEffect(() => {
    const path = pathRef.current;
    const packet = packetRef.current;
    if (!path || !packet) return;
    const len = path.getTotalLength();
    path.style.strokeDasharray = `${len} ${len}`;
    if (!animate) {
      path.style.strokeDashoffset = String(len * (1 - stopAt));
      const p = path.getPointAtLength(len * stopAt);
      packet.setAttribute("cx", String(p.x));
      packet.setAttribute("cy", String(p.y));
      return;
    }
    let raf = 0;
    let start: number | null = null;
    const tick = (now: number) => {
      start ??= now;
      const t = Math.min(1, (now - start) / DRAW_MS);
      const e = ease(t) * stopAt;
      path.style.strokeDashoffset = String(len * (1 - e));
      const p = path.getPointAtLength(len * e);
      packet.setAttribute("cx", String(p.x));
      packet.setAttribute("cy", String(p.y));
      if (t < 1) raf = requestAnimationFrame(tick);
      else setArrived(true);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [animate, stopAt]);

  return (
    <g>
      <path ref={pathRef} d={d} fill="none" stroke="var(--signal)" strokeWidth={2.25} strokeLinecap="round" />
      <circle ref={packetRef} r={5.5} fill="var(--signal)" stroke="var(--card)" strokeWidth={2} />
      {blocked && arrived ? <BlockMark at={stop} /> : null}
    </g>
  );
}

function Controls({
  playing,
  atStart,
  atEnd,
  onPlay,
  onPrev,
  onNext,
  onReplay,
}: {
  playing: boolean;
  atStart: boolean;
  atEnd: boolean;
  onPlay: () => void;
  onPrev: () => void;
  onNext: () => void;
  onReplay: () => void;
}) {
  const btn =
    "inline-flex size-10 items-center justify-center rounded-[4px] border border-rule-strong text-ink transition-colors hover:border-ink disabled:opacity-35 disabled:hover:border-rule-strong";
  return (
    <div className="flex items-center gap-1.5" role="group" aria-label="Trace controls">
      <button type="button" className={btn} onClick={onPrev} disabled={atStart} aria-label="Previous step">
        <StepBack />
      </button>
      <button
        type="button"
        className={cx(btn, "border-ink bg-ink text-paper hover:bg-signal hover:border-signal")}
        onClick={onPlay}
        aria-label={playing ? "Pause" : atEnd ? "Play from the start" : "Play"}
      >
        {playing ? <Pause /> : <Play />}
      </button>
      <button type="button" className={btn} onClick={onNext} disabled={atEnd} aria-label="Next step">
        <StepForward />
      </button>
      <button type="button" className={btn} onClick={onReplay} aria-label="Replay this trace">
        <Replay />
      </button>
    </div>
  );
}
