import Link from "next/link";
import { getLogEntries, getProjects, getSettings, getToolEvidence } from "@/db/queries/public";
import { siteUrl } from "@/lib/env";
import { JsonLd, personSchema, websiteSchema } from "@/lib/seo";
import { Hero } from "@/components/home/hero";
import { ProblemIndex } from "@/components/home/problem-index";
import { SystemFiles } from "@/components/home/system-files";
import { StackByLayer } from "@/components/home/stack-by-layer";
import { Method } from "@/components/home/method";
import { Engagements } from "@/components/home/engagements";
import { LogList } from "@/components/lab/log-list";
import { ButtonLink, Section } from "@/components/ui/primitives";

export default async function HomePage() {
  const [settings, projects, log, evidence] = await Promise.all([
    getSettings(),
    getProjects(),
    getLogEntries(),
    getToolEvidence(),
  ]);
  const latest = log.slice(0, 4);
  const base = siteUrl();

  // Section numbers follow what's actually on the page.
  let n = 0;
  const next = () => String(++n).padStart(2, "0");

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [personSchema(base, settings), websiteSchema(base)],
        }}
      />
      <Hero settings={settings} />
      <ProblemIndex n={next()} evidence={evidence} />
      <SystemFiles n={next()} projects={projects} />

      <Section id="stack" n={next()} label="The stack, by layer">
        <h2 id="stack-title" className="headline max-w-3xl">
          Broad on purpose. Every layer of a system, and the security that runs through all of them.
        </h2>
        <p className="lede mt-5 max-w-2xl">
          Tools are grouped by where they sit in a system, not by how confident I sound about them. Where a
          tool was used in documented work, it links there.
        </p>
        <div className="mt-12">
          <StackByLayer evidence={evidence} headingId="stack-title" />
        </div>
      </Section>

      <Section id="method" n={next()} label="How I work">
        <h2 id="method-title" className="headline max-w-3xl">
          Problem to production, with security as a stage of its own.
        </h2>
        <p className="lede mt-5 max-w-2xl">
          Every engagement moves along the same path. Each stage ends in something you can read, run or
          check, not a status update.
        </p>
        <div className="mt-14">
          <Method />
        </div>
      </Section>

      {latest.length > 0 ? (
        <Section id="lab" n={next()} label="Lab">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 id="lab-title" className="headline max-w-3xl">
                Build logs, security work and experiments.
              </h2>
              <p className="lede mt-5 max-w-2xl">The working notes behind the finished systems.</p>
            </div>
            <Link href="/lab" className="link-underline text-[0.95rem] text-ink">
              All entries
            </Link>
          </div>
          <div className="mt-10">
            <LogList entries={latest} />
          </div>
        </Section>
      ) : null}

      <Section id="hire" n={next()} label="Bring me a problem">
        <h2 id="hire-title" className="headline max-w-3xl">
          Five ways to start. Each one begins with something small and concrete.
        </h2>
        <p className="lede mt-5 max-w-2xl">
          Pick the closest fit, or describe the problem in your own words. The brief form asks the right
          questions either way.
        </p>
        <div className="mt-12">
          <Engagements />
        </div>
        <div className="mt-10">
          <ButtonLink href="/hire">Write a project brief</ButtonLink>
        </div>
      </Section>
    </>
  );
}
