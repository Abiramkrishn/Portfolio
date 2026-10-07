import type { PublicProject } from "@/db/queries/public";
import { ButtonLink, Section } from "@/components/ui/primitives";
import { FeaturedFile } from "@/components/work/featured-file";
import { RegisterHeader, RegisterRow, Workshop } from "@/components/work/register";

export function SystemFiles({ n, projects }: { n: string; projects: PublicProject[] }) {
  const filed = projects.filter((p) => p.stage !== "upcoming");
  const featured = filed.find((p) => p.featured) ?? null;
  const rest = filed.filter((p) => p !== featured);
  const workshop = projects.filter((p) => p.stage === "upcoming");

  return (
    <Section id="work" n={n} label="System files">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 id="work-title" className="headline max-w-3xl">
            What I&apos;ve built, documented as systems rather than screenshots.
          </h2>
          <p className="lede mt-5 max-w-2xl">
            Each file records the problem, the architecture, the decisions and their trade-offs, and how the
            system was tested and attacked. Where there are no measured outcomes, none are claimed.
          </p>
        </div>
      </div>

      {featured ? (
        <div className="mt-12">
          <FeaturedFile project={featured} />
        </div>
      ) : null}

      {rest.length > 0 ? (
        <div className="mt-12">
          <RegisterHeader />
          <ol>
            {rest.map((p) => (
              <RegisterRow key={p.id} project={p} />
            ))}
          </ol>
        </div>
      ) : null}

      <Workshop projects={workshop} />

      <div className="mt-10">
        <ButtonLink href="/work" variant="secondary">
          Open the full register
        </ButtonLink>
      </div>
    </Section>
  );
}
