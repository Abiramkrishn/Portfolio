import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getLogEntries, getLogEntry } from "@/db/queries/public";
import { siteUrl } from "@/lib/env";
import { JsonLd, breadcrumbs } from "@/lib/seo";
import { Markdown } from "@/components/markdown";
import { KIND_LABEL, formatDate } from "@/components/lab/log-list";
import { Chip } from "@/components/ui/primitives";
import { ArrowLeft, ArrowUpRight } from "@/components/ui/icons";

export async function generateStaticParams() {
  const slugs = (await getLogEntries()).map((e) => ({ slug: e.slug }));
  return slugs.length > 0 ? slugs : [{ slug: "__none__" }];
}

export async function generateMetadata({ params }: PageProps<"/lab/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const e = await getLogEntry(slug);
  if (!e) return { title: "Not found", robots: { index: false } };
  return {
    title: `${e.title} (${e.code})`,
    description: e.summary || `${KIND_LABEL[e.kind]} from Abiram Krishn's lab.`,
    alternates: { canonical: `/lab/${e.slug}` },
    openGraph: {
      type: "article",
      title: e.title,
      description: e.summary,
      url: `/lab/${e.slug}`,
      ...(e.publishedAt ? { publishedTime: new Date(e.publishedAt).toISOString() } : {}),
    },
    robots: e.visibility === "published" ? undefined : { index: false },
  };
}

export default function LabEntryPage({ params }: PageProps<"/lab/[slug]">) {
  return (
    <Suspense fallback={<div className="container-page min-h-[60vh] pt-16" aria-hidden="true" />}>
      {params.then(({ slug }) => (
        <Entry slug={slug} />
      ))}
    </Suspense>
  );
}

async function Entry({ slug }: { slug: string }) {
  const e = await getLogEntry(slug);
  if (!e) notFound();
  const base = siteUrl();

  return (
    <article className="container-page pt-10 pb-20 md:pt-16 md:pb-28">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "TechArticle",
              headline: e.title,
              description: e.summary,
              url: `${base}/lab/${e.slug}`,
              author: { "@type": "Person", "@id": `${base}/#person`, name: "Abiram Krishn" },
              keywords: e.tags.join(", "),
              ...(e.publishedAt ? { datePublished: new Date(e.publishedAt).toISOString() } : {}),
            },
            breadcrumbs(base, [
              { name: "Home", path: "/" },
              { name: "Lab", path: "/lab" },
              { name: e.title, path: `/lab/${e.slug}` },
            ]),
          ],
        }}
      />
      <div className="lg:grid lg:grid-cols-12 lg:gap-x-10">
        <div className="lg:col-span-3">
          <nav aria-label="Breadcrumb">
            <Link href="/lab" className="label inline-flex min-h-10 items-center gap-1.5 text-ink-3 hover:text-ink">
              <ArrowLeft size={12} /> Lab
            </Link>
          </nav>
          <dl className="mt-8 hidden space-y-4 lg:block">
            <Meta label="Entry">{e.code}</Meta>
            <Meta label="Kind">{KIND_LABEL[e.kind]}</Meta>
            {e.publishedAt ? (
              <Meta label="Date">
                <time dateTime={new Date(e.publishedAt).toISOString()}>{formatDate(e.publishedAt)}</time>
              </Meta>
            ) : null}
            {e.project ? (
              <Meta label="Related">
                <Link href={`/work/${e.project.slug}`} className="text-ink hover:text-signal-ink">
                  {e.project.code} · {e.project.title}
                </Link>
              </Meta>
            ) : null}
          </dl>
        </div>

        <div className="min-w-0 lg:col-span-9">
          <p className="label mt-8 flex flex-wrap gap-x-3 text-ink-3 lg:mt-0">
            <span className="text-signal-ink">{e.code}</span>
            <span>{KIND_LABEL[e.kind]}</span>
            {e.publishedAt ? <span className="lg:hidden">{formatDate(e.publishedAt)}</span> : null}
          </p>
          <h1 className="headline mt-4 max-w-4xl">{e.title}</h1>
          {e.summary ? <p className="lede mt-5 max-w-3xl">{e.summary}</p> : null}

          <div className="mt-10 border-t border-rule pt-10">
            <Markdown>{e.body}</Markdown>
          </div>

          {e.links.length > 0 ? (
            <ul className="mt-10 border-t border-rule">
              {e.links.map((l) => (
                <li key={l.url} className="border-b border-rule">
                  <a href={l.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between py-3 hover:text-signal-ink">
                    {l.label}
                    <ArrowUpRight />
                  </a>
                </li>
              ))}
            </ul>
          ) : null}

          {e.tags.length > 0 ? (
            <ul className="mt-10 flex flex-wrap gap-1.5" aria-label="Tags">
              {e.tags.map((t) => (
                <li key={t}>
                  <Chip>{t}</Chip>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function Meta({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="label text-ink-3">{label}</dt>
      <dd className="mt-1 text-[0.92rem] text-ink-2">{children}</dd>
    </div>
  );
}
