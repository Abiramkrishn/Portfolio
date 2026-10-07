import type { Metadata } from "next";
import { faq } from "@/content/site";
import { getSettings } from "@/db/queries/public";
import { BriefForm } from "@/components/hire/brief-form";
import { CoverageStrip } from "@/components/schematic/coverage-strip";
import { contactLinks } from "@/components/site/contact-links";
import { availabilityLabel } from "@/components/site/availability";
import { SectionMark, cx } from "@/components/ui/primitives";
import { ArrowUpRight, Plus } from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "Hire: start a project",
  description:
    "Send Abiram Krishn a project brief: building a product, integrating systems, adding AI, or a security and production-readiness audit.",
  alternates: { canonical: "/hire" },
};

export default async function HirePage() {
  const settings = await getSettings();
  const links = contactLinks(settings);
  const steps = [
    ["You send a brief", "Five minutes. The questions are the ones I'd ask on a first call."],
    ["I reply", `${capitalise(settings.responseTime)}, with questions or a suggested first step.`],
    ["A small first step", "Something concrete and bounded: an outline, an evaluation, a scoped audit."],
    ["Then the build", "Problem to production, with security as a stage of its own."],
  ];

  return (
    <div className="container-page pt-12 pb-20 md:pt-20 md:pb-28">
      <SectionMark n="H" label="Hire" />
      <div className="mt-6 grid gap-x-10 gap-y-14 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <h1 className="display">
            Bring me a <span className="text-signal-ink">problem</span>.
          </h1>
          <p className="lede mt-6 max-w-2xl">
            A new product, systems that need connecting, AI that has to work on real conversations, or an
            application that needs attacking before someone else does. Describe it below.
          </p>
          <p className="mt-6 flex items-center gap-2 text-[0.95rem] text-ink-2">
            <span
              aria-hidden="true"
              className={cx("size-1.5 rounded-full", settings.availability === "closed" ? "bg-ink-3" : "bg-signal")}
            />
            {availabilityLabel(settings)}
          </p>

          <div className="mt-12 border-t border-rule pt-10">
            <BriefForm responseTime={settings.responseTime} />
          </div>
        </div>

        <aside className="space-y-12 lg:col-span-5 lg:pt-4" aria-label="How it works">
          <div className="lg:sticky lg:top-24 lg:space-y-12">
            <div>
              <p className="label text-ink-3">How it works</p>
              <ol className="mt-4 border-t border-rule">
                {steps.map(([title, body], i) => (
                  <li key={title} className="grid grid-cols-[2.25rem_1fr] gap-2 border-b border-rule py-4">
                    <span className="label pt-1 text-signal-ink">{String(i + 1).padStart(2, "0")}</span>
                    <span>
                      <span className="block font-medium text-ink">{title}</span>
                      <span className="mt-0.5 block text-[0.92rem] text-ink-2">{body}</span>
                    </span>
                  </li>
                ))}
              </ol>
              <div className="mt-6">
                <p className="label text-ink-3">The path every engagement follows</p>
                <CoverageStrip
                  size="lg"
                  className="mt-3"
                  coverage={{ problem: "", architecture: "", build: "", integrate: "", automate: "", secure: "", ship: "" }}
                />
              </div>
            </div>

            {links.length > 0 ? (
              <div className="mt-12 lg:mt-0">
                <p className="label text-ink-3">Or reach me directly</p>
                <ul className="mt-4 border-t border-rule">
                  {links.map((l) => (
                    <li key={l.label} className="border-b border-rule">
                      <a
                        href={l.href}
                        {...(l.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                        className="group flex items-center justify-between gap-4 py-3"
                      >
                        <span className="label text-ink-3">{l.label}</span>
                        <span className="flex min-w-0 items-center gap-1.5 truncate text-ink group-hover:text-signal-ink">
                          <span className="truncate">{l.value}</span>
                          {l.external ? <ArrowUpRight size={12} className="shrink-0" /> : null}
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="mt-12 lg:mt-0">
              <p className="label text-ink-3">Questions</p>
              <ul className="mt-4 border-t border-rule">
                {faq.map((item) => (
                  <li key={item.q} className="border-b border-rule">
                    <details className="disclosure group">
                      <summary className="flex items-start justify-between gap-4 py-4">
                        <span className="font-medium text-ink">{item.q}</span>
                        <span className="disclosure-icon mt-0.5 text-ink-2">
                          <Plus />
                        </span>
                      </summary>
                      <p className="pb-4 text-[0.95rem] leading-relaxed text-ink-2">
                        {item.a.replace("{responseTime}", settings.responseTime)}
                      </p>
                    </details>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function capitalise(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
