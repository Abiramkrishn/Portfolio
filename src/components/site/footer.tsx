import Link from "next/link";
import { cacheLife } from "next/cache";
import { getProjects, getSettings, hasCaseStudy } from "@/db/queries/public";
import { site } from "@/content/site";
import { ButtonLink, cx } from "@/components/ui/primitives";
import { ArrowUpRight } from "@/components/ui/icons";
import { availabilityLabel } from "./availability";
import { contactLinks } from "./contact-links";
import { ThemeChooser } from "./theme";
import { Wordmark } from "./header";

export async function SiteFooter() {
  "use cache";
  cacheLife("max");
  const [settings, projects] = await Promise.all([getSettings(), getProjects()]);
  const colophon = projects.find((p) => p.slug === "portfolio-system" && hasCaseStudy(p));
  const links = contactLinks(settings);
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-rule bg-paper-2/60">
      <div className="container-page py-16 md:py-20">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="label text-ink-3">
              <span className="text-signal-ink">§</span> End of file
            </p>
            <p className="headline mt-4 max-w-2xl">
              Have a system that needs building, <span className="text-signal-ink">or breaking</span>?
            </p>
            <ButtonLink href="/hire" className="mt-8">
              Start a project
            </ButtonLink>
          </div>

          <div className="grid gap-8 sm:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)_minmax(0,1fr)] lg:col-span-5">
            <div>
              <p className="label text-ink-3">Site</p>
              <ul className="mt-2 text-[0.95rem]">
                {[
                  ["/work", "Work"],
                  ["/lab", "Lab"],
                  ["/about", "About"],
                  ["/hire", "Hire"],
                ].map(([href, label]) => (
                  <li key={href}>
                    <Link href={href} className="inline-flex min-h-9 items-center text-ink-2 hover:text-ink">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="label text-ink-3">Contact</p>
              <ul className="mt-2 text-[0.95rem]">
                {links.length === 0 ? (
                  <li>
                    <Link href="/hire" className="inline-flex min-h-9 items-center text-ink-2 hover:text-ink">
                      Send a brief
                    </Link>
                  </li>
                ) : (
                  links.map((l) => (
                    <li key={l.label}>
                      <a
                        href={l.href}
                        {...(l.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                        className="inline-flex min-h-9 items-center gap-1 text-ink-2 hover:text-ink"
                      >
                        {/* Email and phone show the value itself; profiles keep a short label. */}
                        {l.label === "Email" || l.label === "Phone" ? (
                          <span className="text-[0.9rem] [overflow-wrap:anywhere]">{l.value}</span>
                        ) : (
                          l.label
                        )}
                        {l.external ? <ArrowUpRight size={12} /> : null}
                      </a>
                    </li>
                  ))
                )}
              </ul>
            </div>
            <div>
              <p className="label text-ink-3">Status</p>
              <p className="mt-3 flex items-start gap-2 text-[0.95rem] text-ink-2">
                <span
                  aria-hidden="true"
                  className={cx(
                    "mt-2 size-1.5 shrink-0 rounded-full",
                    settings.availability === "closed" ? "bg-ink-3" : "bg-signal",
                  )}
                />
                {availabilityLabel(settings)}
              </p>
              {settings.location || settings.timezone ? (
                <p className="mt-2 text-[0.9rem] text-ink-3">
                  {[settings.location, settings.timezone].filter(Boolean).join(" · ")}
                </p>
              ) : null}
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-6 border-t border-rule pt-6 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <Wordmark />
            <p className="text-[0.85rem] text-ink-3">
              © {year} {site.name}.
              {colophon ? (
                <>
                  {" "}This site is{" "}
                  <Link href={`/work/${colophon.slug}`} className="link-underline text-ink-2">
                    {colophon.code}
                  </Link>
                  . Read how it&apos;s built.
                </>
              ) : null}
            </p>
          </div>
          <ThemeChooser />
        </div>
      </div>
    </footer>
  );
}
