import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import { getMediaMeta, getProject, getProjects, hasCaseStudy, type PublicProject } from "@/db/queries/public";
import { DOMAINS, type DomainKey } from "@/content/taxonomy";
import type { EngagementKey } from "@/content/site";
import { siteUrl } from "@/lib/env";
import { JsonLd, breadcrumbs } from "@/lib/seo";
import { Markdown } from "@/components/markdown";
import { Schematic } from "@/components/schematic/schematic";
import { CoverageStrip } from "@/components/schematic/coverage-strip";
import { Contents, type ContentsItem } from "@/components/work/contents";
import { DecisionRecords, FieldNotes } from "@/components/work/records";
import { EvidenceGallery } from "@/components/work/evidence";
import { ButtonLink, Chip, Stage } from "@/components/ui/primitives";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "@/components/ui/icons";

const PLACEHOLDER = "__none__";

export async function generateStaticParams() {
  const slugs = (await getProjects()).filter(hasCaseStudy).map((p) => ({ slug: p.slug }));
  // Cache Components needs at least one param to validate the route; it resolves to a 404.
  return slugs.length > 0 ? slugs : [{ slug: PLACEHOLDER }];
}

export async function generateMetadata({ params }: PageProps<"/work/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProject(slug);
  if (!p || !hasCaseStudy(p)) return { title: "Not found", robots: { index: false } };
  const description = p.seoDescription || p.summary || p.tagline;
  return {
    title: p.seoTitle || `${p.title} (${p.code})`,
    description,
    alternates: { canonical: `/work/${p.slug}` },
    openGraph: {
      type: "article",
      title: `${p.title} · ${p.code}`,
      description,
      url: `/work/${p.slug}`,
      ...(p.publishedAt ? { publishedTime: new Date(p.publishedAt).toISOString() } : {}),
    },
    robots: p.visibility === "published" ? undefined : { index: false },
  };
}

export default function SystemFilePage({ params }: PageProps<"/work/[slug]">) {
  return (
    <Suspense fallback={<FileSkeleton />}>
      {params.then(({ slug }) => (
        <SystemFile slug={slug} />
      ))}
    </Suspense>
  );
}

const ENGAGEMENT_FOR: Record<string, EngagementKey> = {
  ai: "ai",
  product: "build",
  integration: "integrate",
  automation: "integrate",
  commerce: "integrate",
  security: "audit",
  infrastructure: "audit",
};

async function SystemFile({ slug }: { slug: string }) {
  const [project, all] = await Promise.all([getProject(slug), getProjects()]);
  if (!project || !hasCaseStudy(project)) notFound();
  const p = project;

  const imageIds = p.evidence.flatMap((e) => (e.kind === "image" ? [e.mediaId] : []));
  const media = await getMediaMeta(imageIds);

  const files = all.filter(hasCaseStudy);
  const i = files.findIndex((f) => f.slug === p.slug);
  const prev = i > 0 ? files[i - 1] : null;
  const next = i >= 0 && i < files.length - 1 ? files[i + 1] : null;
  const engagement = ENGAGEMENT_FOR[p.domains[0] ?? "product"] ?? "build";

  const sections: (ContentsItem & { body: ReactNode; tone?: "break" })[] = [];
  const add = (id: string, label: string, show: boolean, body: () => ReactNode, tone?: "break") => {
    if (show) sections.push({ id, label, body: body(), tone });
  };
  add("problem", "Problem", Boolean(p.problem.trim()), () => <Markdown>{p.problem}</Markdown>);
  add("built", "What I built", Boolean(p.built.trim()), () => <Markdown>{p.built}</Markdown>);
  add("system", "System", p.diagram.nodes.length > 0, () => (
    <Schematic diagram={p.diagram} figure={`Fig. ${p.code}`} />
  ));
  add("decisions", "Decisions", p.decisions.length > 0, () => <DecisionRecords decisions={p.decisions} />);
  add("field-notes", "Field notes", p.challenges.length > 0, () => <FieldNotes challenges={p.challenges} />);
  add("break-test", "Break test", Boolean(p.security.trim()), () => <Markdown>{p.security}</Markdown>, "break");
  add("testing", "Testing & readiness", Boolean(p.testing.trim()), () => <Markdown>{p.testing}</Markdown>);
  add("outcomes", "Outcomes", Boolean(p.outcomes.trim()), () => <Markdown>{p.outcomes}</Markdown>);
  add("evidence", "Evidence", p.evidence.length > 0, () => <EvidenceGallery items={p.evidence} media={media} />);

  const base = siteUrl();

  return (
    <article>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Article",
              headline: p.title,
              description: p.summary || p.tagline,
              url: `${base}/work/${p.slug}`,
              author: { "@type": "Person", "@id": `${base}/#person`, name: "Abiram Krishn" },
              keywords: p.stack.join(", "),
              ...(p.publishedAt ? { datePublished: new Date(p.publishedAt).toISOString() } : {}),
            },
            breadcrumbs(base, [
              { name: "Home", path: "/" },
              { name: "Work", path: "/work" },
              { name: p.title, path: `/work/${p.slug}` },
            ]),
          ],
        }}
      />

      <header className="container-page pt-10 pb-12 md:pt-16 md:pb-16">
        <nav aria-label="Breadcrumb" className="label flex items-center gap-2 text-ink-3">
          <Link href="/work" className="inline-flex min-h-10 items-center gap-1.5 hover:text-ink">
            <ArrowLeft size={12} /> System register
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-signal-ink" aria-current="page">
            {p.code}
          </span>
        </nav>

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <span className="label text-signal-ink">{p.code}</span>
          <Stage stage={p.stage} />
          {p.visibility === "draft" ? <Chip tone="signal">Draft preview</Chip> : null}
        </div>
        <h1 className="display mt-4 max-w-5xl">{p.title}</h1>
        {p.tagline ? <p className="lede mt-6 max-w-3xl">{p.tagline}</p> : null}

        <dl className="mt-10 grid grid-cols-[repeat(auto-fit,minmax(15rem,1fr))] gap-px overflow-hidden rounded-[4px] border border-rule bg-rule">
          {p.role ? <Spec label="Role">{p.role}</Spec> : null}
          {p.timeframe ? <Spec label="Timeframe">{p.timeframe}</Spec> : null}
          {p.domains.length ? (
            <Spec label="Domains">{p.domains.map((d) => DOMAINS[d as DomainKey]?.label ?? d).join(", ")}</Spec>
          ) : null}
          {p.links.length ? (
            <Spec label="Links">
              <ul className="space-y-1">
                {p.links.map((l) => (
                  <li key={l.url}>
                    <a href={l.url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-8 items-center gap-1 text-ink hover:text-signal-ink">
                      {l.label} <ArrowUpRight size={12} />
                    </a>
                  </li>
                ))}
              </ul>
            </Spec>
          ) : null}
        </dl>

        {Object.keys(p.coverage).length > 0 ? (
          <div className="mt-10">
            <p className="label text-ink-3">Lifecycle coverage: where my work sat</p>
            <CoverageStrip coverage={p.coverage} size="lg" showNotes className="mt-3" />
          </div>
        ) : null}

        {p.stack.length > 0 ? (
          <ul className="mt-8 flex flex-wrap gap-1.5" aria-label="Stack">
            {p.stack.map((s) => (
              <li key={s}>
                <Chip>{s}</Chip>
              </li>
            ))}
          </ul>
        ) : null}
      </header>

      <div className="container-page border-t border-rule pb-20 lg:grid lg:grid-cols-12 lg:gap-x-10">
        <aside className="lg:col-span-3">
          <div className="lg:sticky lg:top-24 lg:pt-14">
            <Contents items={sections.map(({ id, label }) => ({ id, label }))} />
          </div>
        </aside>

        <div className="min-w-0 lg:col-span-9">
          {sections.map((s, idx) => (
            <section key={s.id} id={s.id} aria-labelledby={`${s.id}-h`} className="scroll-mt-28 border-b border-rule py-12 last:border-b-0 md:py-16">
              <h2 id={`${s.id}-h`} className="flex items-baseline gap-4">
                <span className="label text-signal-ink">{String(idx + 1).padStart(2, "0")}</span>
                <span className="title">{s.label}</span>
              </h2>
              <div className="mt-6">
                {s.tone === "break" ? (
                  <div className="relative rounded-[6px] border border-dashed border-signal p-5 md:p-7">
                    <p className="label absolute -top-2.5 left-4 bg-paper px-2 text-signal-ink">
                      Security boundary: how this system was attacked
                    </p>
                    {s.body}
                  </div>
                ) : (
                  s.body
                )}
              </div>
            </section>
          ))}
        </div>
      </div>

      <footer className="border-t border-rule bg-paper-2/60">
        <div className="container-page grid gap-10 py-14 md:grid-cols-2 md:py-16">
          <div>
            <p className="label text-ink-3">Next step</p>
            <p className="headline mt-3">Need something like this?</p>
            <ButtonLink href={`/hire?type=${engagement}`} className="mt-6">
              Start a project
            </ButtonLink>
          </div>
          {prev || next ? (
            <nav aria-label="More system files" className="grid gap-px self-end overflow-hidden rounded-[4px] border border-rule bg-rule sm:grid-cols-2">
              {prev ? <FileLink project={prev} direction="prev" /> : <span className="hidden bg-paper sm:block" />}
              {next ? <FileLink project={next} direction="next" /> : <span className="hidden bg-paper sm:block" />}
            </nav>
          ) : null}
        </div>
      </footer>
    </article>
  );
}

function Spec({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="bg-paper px-4 py-3.5">
      <dt className="label text-ink-3">{label}</dt>
      <dd className="mt-1.5 text-[0.92rem] leading-snug text-ink-2">{children}</dd>
    </div>
  );
}

function FileLink({ project, direction }: { project: PublicProject; direction: "prev" | "next" }) {
  return (
    <Link href={`/work/${project.slug}`} className="group bg-paper p-5 transition-colors hover:bg-card">
      <span className="label flex items-center gap-1.5 text-ink-3">
        {direction === "prev" ? <ArrowLeft size={12} /> : null}
        {direction === "prev" ? "Previous file" : "Next file"}
        {direction === "next" ? <ArrowRight size={12} /> : null}
      </span>
      <span className="mt-2 block">
        <span className="label text-signal-ink">{project.code}</span>
        <span className="mt-1 block font-medium text-ink group-hover:text-signal-ink">{project.title}</span>
      </span>
    </Link>
  );
}

function FileSkeleton() {
  return (
    <div className="container-page animate-pulse pt-16 pb-24 motion-reduce:animate-none" aria-hidden="true">
      <div className="h-3 w-40 rounded bg-paper-2" />
      <div className="mt-8 h-16 w-2/3 rounded bg-paper-2" />
      <div className="mt-6 h-5 w-1/2 rounded bg-paper-2" />
      <div className="mt-12 h-24 w-full rounded bg-paper-2" />
    </div>
  );
}
