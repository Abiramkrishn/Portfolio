import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { LIFECYCLE, type Coverage } from "./types";

export const OG_SIZE = { width: 1200, height: 630 };

const font = (file: string) => readFile(join(process.cwd(), "assets/fonts", file));
const fontsPromise = Promise.all([
  font("ibm-plex-sans-condensed-latin-600-normal.woff"),
  font("ibm-plex-sans-latin-400-normal.woff"),
  font("ibm-plex-mono-latin-500-normal.woff"),
]);

const C = { paper: "#f2f0ea", card: "#f8f7f3", ink: "#141414", ink2: "#3b3a36", ink3: "#66645d", rule: "#d7d3c9", signal: "#e5480b" };

/** The shared Open Graph card: a page from the engineering manual. */
export async function ogImage({
  kicker,
  title,
  subtitle,
  coverage,
  emphasis,
  lines,
}: {
  kicker: string;
  title: string;
  subtitle?: string;
  coverage?: Coverage;
  /** Optional trailing words in signal orange. */
  emphasis?: string;
  /** Explicit title lines; words flagged `signal` are set in orange. Overrides title/emphasis. */
  lines?: { text: string; signal?: boolean }[][];
}) {
  const [condensed, sans, mono] = await fontsPromise;
  const covered = coverage ? LIFECYCLE.filter((k) => k in coverage) : [];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: C.paper,
          backgroundImage: `linear-gradient(${C.rule}55 1px, transparent 1px), linear-gradient(90deg, ${C.rule}55 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
          padding: "64px 72px",
          fontFamily: "Plex Sans",
          color: C.ink,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontFamily: "Plex Mono", fontSize: 22, letterSpacing: 2, color: C.ink3 }}>
          <div style={{ width: 14, height: 14, borderRadius: 7, background: C.signal }} />
          <div style={{ display: "flex", color: C.signal }}>{kicker.toUpperCase()}</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {lines ? (
            <div style={{ display: "flex", flexDirection: "column", fontFamily: "Plex Sans Condensed", fontSize: 98, fontWeight: 600, letterSpacing: -2, lineHeight: 1.02 }}>
              {lines.map((line, i) => (
                <div key={i} style={{ display: "flex", gap: 24 }}>
                  {line.map((part, j) => (
                    <span key={j} style={{ color: part.signal ? C.signal : C.ink }}>
                      {part.text}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          ) : (
          <div style={{ display: "flex", flexWrap: "wrap", fontFamily: "Plex Sans Condensed", fontSize: title.length > 40 ? 78 : 98, fontWeight: 600, letterSpacing: -2, lineHeight: 1 }}>
            {title}
            {emphasis ? (
              <span style={{ color: C.signal, marginLeft: 22 }}>
                {emphasis}
              </span>
            ) : null}
          </div>
          )}
          {subtitle ? (
            <div style={{ display: "flex", fontSize: 32, lineHeight: 1.35, color: C.ink2, maxWidth: 980 }}>{subtitle}</div>
          ) : null}
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: `2px solid ${C.ink}`, paddingTop: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, fontFamily: "Plex Sans Condensed", fontSize: 30, fontWeight: 600 }}>
            <div style={{ display: "flex", width: 34, height: 34, border: `3px solid ${C.ink}`, borderRadius: 6, alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: 12, height: 12, borderRadius: 6, background: C.signal }} />
            </div>
            Abiram Krishn
          </div>
          {covered.length > 0 ? (
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {LIFECYCLE.map((k) => (
                <div
                  key={k}
                  style={{ width: 34, height: 14, borderRadius: 2, background: k in coverage! ? C.signal : "transparent", border: k in coverage! ? "none" : `2px solid ${C.rule}` }}
                />
              ))}
              <div style={{ display: "flex", marginLeft: 10, fontFamily: "Plex Mono", fontSize: 20, color: C.ink3 }}>
                {covered.length}/7 STAGES
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", fontFamily: "Plex Mono", fontSize: 20, color: C.ink3, letterSpacing: 2 }}>
              BUILD · INTEGRATE · AUTOMATE · SECURE
            </div>
          )}
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [
        { name: "Plex Sans Condensed", data: condensed, weight: 600, style: "normal" },
        { name: "Plex Sans", data: sans, weight: 400, style: "normal" },
        { name: "Plex Mono", data: mono, weight: 500, style: "normal" },
      ],
    },
  );
}
