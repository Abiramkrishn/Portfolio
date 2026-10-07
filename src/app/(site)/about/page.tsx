import type { Metadata } from "next";
import { about, principles } from "@/content/site";
import { getSettings, getToolEvidence } from "@/db/queries/public";
import { siteUrl } from "@/lib/env";
import { JsonLd, personSchema } from "@/lib/seo";
import { StackByLayer } from "@/components/home/stack-by-layer";
import { Markdown } from "@/components/markdown";
import { contactLinks } from "@/components/site/contact-links";
import { availabilityLabel } from "@/components/site/availability";
import { ButtonLink, Section, SectionMark } from "@/components/ui/primitives";
import { ArrowUpRight } from "@/components/ui/icons";
import { ProfileCard, ProfileRow } from "@/components/site/portrait";

export const metadata: Metadata = {
  title: "About",
  description:
    "Abiram Krishn is an independent engineer who builds AI applications, SaaS products, integrations and automation, and secures them like an attacker would.",
  alternates: { canonical: "/about" },
};

export default async function AboutPage() {
  const [settings, evidence] = await Promise.all([getSettings(), getToolEvidence()]);
  const links = contactLinks(settings);
  const base = siteUrl();
  let n = 0;
  const next = () => String(++n).padStart(2, "0");

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ProfilePage",
          url: `${base}/about`,
          mainEntity: personSchema(base, settings),
        }}
      />
      <div className="container-page pt-12 pb-16 md:pt-20 md:pb-24">
        <SectionMark n="A" label="About" />
        {/* Mobile order: heading, then the profile card, then the story. Desktop: story left, card right. */}
        <div className="mt-6 grid gap-10 lg:grid-cols-12 lg:grid-rows-[auto_1fr] lg:gap-x-10 lg:gap-y-10">
          <h1 className="display lg:col-span-8 lg:row-start-1">
            Builder and <span className="text-signal-ink">breaker</span>.
          </h1>
          <aside
            className="lg:col-span-4 lg:col-start-9 lg:row-span-2 lg:row-start-1"
            aria-label="At a glance"
          >
            <ProfileCard
              sizes="(min-width: 1024px) 380px, (min-width: 640px) 320px, 85vw"
              preload
              className="max-w-[22rem] lg:max-w-none"
            >
              <dl className="divide-y divide-rule">
                {settings.location || settings.timezone ? (
                  <ProfileRow label="Based">{[settings.location, settings.timezone].filter(Boolean).join(" · ")}</ProfileRow>
                ) : null}
                <ProfileRow label="Status">{availabilityLabel(settings)}</ProfileRow>
                {links.map((l) => (
                  <ProfileRow key={l.label} label={l.label}>
                    <a
                      href={l.href}
                      {...(l.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      className="inline-flex items-center gap-1 text-ink hover:text-signal-ink"
                    >
                      {l.value}
                      {l.external ? <ArrowUpRight size={12} /> : null}
                    </a>
                  </ProfileRow>
                ))}
                {settings.cvUrl ? (
                  <ProfileRow label="CV">
                    <a href={settings.cvUrl} target="_blank" rel="noopener noreferrer" className="text-ink hover:text-signal-ink">
                      Download
                    </a>
                  </ProfileRow>
                ) : null}
              </dl>
            </ProfileCard>
          </aside>
          <div className="space-y-5 lg:col-span-8 lg:col-start-1 lg:row-start-2">
            {about.intro.map((p) => (
              <p key={p} className="lede">
                {p}
              </p>
            ))}
          </div>
        </div>
      </div>

      {settings.now ? (
        <Section id="now" n={next()} label="Now">
          <h2 id="now-title" className="title">What I&apos;m working on</h2>
          <div className="mt-4">
            <Markdown>{settings.now}</Markdown>
          </div>
        </Section>
      ) : null}

      <Section id="principles" n={next()} label="How I think">
        <h2 id="principles-title" className="headline max-w-3xl">
          The rules I hold my own work to.
        </h2>
        <ol className="mt-10 border-t border-rule">
          {principles.map((p, i) => (
            <li key={p.title} className="grid gap-2 border-b border-rule py-6 md:grid-cols-[3rem_18rem_1fr] md:gap-6">
              <span className="label pt-1 text-signal-ink">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="font-semibold text-ink">{p.title}</h3>
              <p className="text-[0.98rem] leading-relaxed text-ink-2">{p.body}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section id="toolkit" n={next()} label="Toolkit">
        <h2 id="toolkit-title" className="headline max-w-3xl">
          The layers I work in.
        </h2>
        <div className="mt-10">
          <StackByLayer evidence={evidence} headingId="toolkit-title" />
        </div>
      </Section>

      {about.experience.length > 0 || about.education.length > 0 ? (
        <Section id="background" n={next()} label="Background">
          <h2 id="background-title" className="headline">Background</h2>
          <div className="mt-10 grid gap-12 md:grid-cols-2">
            {[
              ["Experience", about.experience],
              ["Education", about.education],
            ].map(([title, items]) =>
              (items as typeof about.experience).length ? (
                <div key={title as string}>
                  <h3 className="label text-ink-3">{title as string}</h3>
                  <ol className="mt-4 border-t border-rule">
                    {(items as typeof about.experience).map((item) => (
                      <li key={item.title} className="border-b border-rule py-4">
                        <p className="mono text-ink-3">{item.period}</p>
                        <p className="mt-1 font-medium text-ink">{item.title}</p>
                        <p className="mt-1 text-[0.95rem] text-ink-2">{item.detail}</p>
                      </li>
                    ))}
                  </ol>
                </div>
              ) : null,
            )}
          </div>
        </Section>
      ) : null}

      <Section id="contact" n={next()} label="Contact">
        <h2 id="contact-title" className="headline max-w-3xl">
          The fastest way to start is a short brief.
        </h2>
        <p className="lede mt-5 max-w-2xl">Tell me what you&apos;re building or what&apos;s broken. I&apos;ll reply {settings.responseTime}.</p>
        <ButtonLink href="/hire" className="mt-8">
          Write a project brief
        </ButtonLink>
      </Section>
    </>
  );
}
