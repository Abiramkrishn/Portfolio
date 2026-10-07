import type { Metadata } from "next";
import { getProjects } from "@/db/queries/public";
import { DOMAIN_KEYS } from "@/content/taxonomy";
import { layoutDiagram } from "@/lib/schematic";
import { siteUrl } from "@/lib/env";
import { JsonLd, breadcrumbs } from "@/lib/seo";
import { SchematicSvg } from "@/components/schematic/schematic-svg";
import { CoverageStrip } from "@/components/schematic/coverage-strip";
import { RegisterHeader, RegisterRow, Workshop } from "@/components/work/register";
import { RegisterExplorer } from "@/components/work/register-explorer";
import { SectionMark } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "Work: the system register",
  description:
    "System files by Abiram Krishn: AI platforms, SaaS, integrations, automation and security work, each documented with its problem, architecture, decisions and testing.",
  alternates: { canonical: "/work" },
};

export default async function WorkPage() {
  const projects = await getProjects();
  const filed = projects.filter((p) => p.stage !== "upcoming");
  const workshop = projects.filter((p) => p.stage === "upcoming");
  const usedDomains = DOMAIN_KEYS.filter((d) => filed.some((p) => p.domains.includes(d)));

  const previews = Object.fromEntries(
    filed
      .filter((p) => p.diagram.nodes.length > 0)
      .map((p) => [
        p.slug,
        <div key={p.slug} className="reg-marks border border-rule bg-card/50 p-4">
          <p className="label text-ink-3">
            <span className="text-signal-ink">{p.code}</span> · Preview
          </p>
          <p className="mt-2 font-medium text-ink">{p.title}</p>
          <div className="grid-paper mt-4 border border-rule bg-paper/50 p-2">
            <SchematicSvg layout={layoutDiagram(p.diagram)} compact idPrefix={`preview-${p.slug}`} />
          </div>
          <p className="label mt-4 text-ink-3">Lifecycle coverage</p>
          <CoverageStrip coverage={p.coverage} className="mt-2" />
          {p.summary ? <p className="mt-4 text-[0.88rem] leading-relaxed text-ink-2">{p.summary}</p> : null}
        </div>,
      ]),
  );
  const initial = filed.find((p) => p.featured && previews[p.slug])?.slug ?? Object.keys(previews)[0] ?? null;

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          ...breadcrumbs(siteUrl(), [
            { name: "Home", path: "/" },
            { name: "Work", path: "/work" },
          ]),
        }}
      />
      <div className="container-page pt-12 pb-20 md:pt-20 md:pb-28">
        <SectionMark n="W" label="System register" />
        <h1 className="display mt-6 max-w-5xl">Systems, filed.</h1>
        <p className="lede mt-6 max-w-2xl">
          Every entry is a system I designed, built, integrated or attacked. Files with a full write-up open into
          the problem, architecture, decisions and testing; the rest are being documented.
        </p>

        <div className="mt-14">
          <RegisterExplorer domains={usedDomains} previews={previews} initialSlug={initial}>
            <RegisterHeader />
            <ol>
              {filed.map((p) => (
                <RegisterRow key={p.id} project={p} headingLevel={2} />
              ))}
            </ol>
          </RegisterExplorer>
        </div>

        <Workshop projects={workshop} />
      </div>
    </>
  );
}
