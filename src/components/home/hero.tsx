import { site } from "@/content/site";
import type { SiteSettings } from "@/lib/types";
import { ButtonLink, cx } from "@/components/ui/primitives";
import { TraceHero } from "@/components/schematic/trace-hero";
import { availabilityLabel } from "@/components/site/availability";
import { ProfileCard, ProfileRow } from "@/components/site/portrait";

export function Hero({ settings }: { settings: SiteSettings }) {
  const spec: [string, string][] = [
    ["Builds", "AI systems, SaaS, integrations, automation"],
    ["Engineers", "Web apps, APIs, backend systems"],
    ["Secures", "Applications, APIs, workflows, infrastructure"],
  ];

  return (
    <section aria-labelledby="hero-title" className="overflow-hidden">
      <div className="container-page pt-12 pb-16 md:pt-20 md:pb-24">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-x-10">
          <div className="lg:col-span-9">
            <p className="label text-ink-3">{site.hero.eyebrow}</p>
            <h1 id="hero-title" className="display mt-6">
              <span className="block">{site.hero.lineOne}</span>
              <span className="block text-ink-2">
                {site.hero.lineTwoLead}{" "}
                <span className="text-signal-ink">{site.hero.lineTwoEmphasis}</span>{" "}
                {site.hero.lineTwoTail}
              </span>
            </h1>
            <p className="lede mt-8 max-w-2xl">{site.hero.sub}</p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <ButtonLink href="/work">See the work</ButtonLink>
              <ButtonLink href="/hire" variant="secondary">
                Start a project
              </ButtonLink>
            </div>
          </div>

          <aside aria-label="Summary" className="w-full max-w-xl self-end lg:col-span-3 lg:max-w-none">
            <ProfileCard sizes="(min-width: 1024px) 300px, 76px" preload compactUntil="lg">
              <dl className="divide-y divide-rule">
                {spec.map(([k, v]) => (
                  <ProfileRow key={k} label={k}>
                    {v}
                  </ProfileRow>
                ))}
                <ProfileRow label="Status">
                  <span className="flex items-start gap-2 text-ink">
                    <span
                      aria-hidden="true"
                      className={cx(
                        "mt-1.5 size-1.5 shrink-0 rounded-full",
                        settings.availability === "closed" ? "bg-ink-3" : "bg-signal",
                      )}
                    />
                    {availabilityLabel(settings)}
                  </span>
                </ProfileRow>
              </dl>
            </ProfileCard>
          </aside>
        </div>

        <TraceHero />
      </div>
    </section>
  );
}
