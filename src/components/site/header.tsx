import Link from "next/link";
import { Suspense } from "react";
import { getSettings } from "@/db/queries/public";
import { site } from "@/content/site";
import { buttonClass, cx } from "@/components/ui/primitives";
import { ArrowRight } from "@/components/ui/icons";
import { availabilityLabel } from "./availability";
import { MobileMenu, NavLinks, NavLinksFallback } from "./nav";
import { ThemeToggle } from "./theme";

export function Wordmark({ className }: { className?: string }) {
  return (
    <Link href="/" className={cx("group inline-flex min-h-10 items-center gap-2.5", className)} aria-label={`${site.name}, home`}>
      <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true" className="shrink-0">
        <path d="M1 11h6" stroke="var(--ink-3)" strokeWidth="1.5" />
        <rect x="7.75" y="4.75" width="12.5" height="12.5" rx="2" fill="none" stroke="var(--ink)" strokeWidth="1.5" />
        <circle cx="14" cy="11" r="2.5" fill="var(--signal)" className="transition-transform duration-300 group-hover:scale-125 [transform-origin:14px_11px]" />
      </svg>
      <span className="text-[1.02rem] font-semibold tracking-[-0.01em] [font-stretch:92%]">{site.name}</span>
    </Link>
  );
}

export async function SiteHeader() {
  const settings = await getSettings();
  const availability = availabilityLabel(settings);
  const open = settings.availability !== "closed";

  return (
    <header className="sticky top-0 z-40 border-b border-rule bg-paper/85 backdrop-blur-md supports-[not(backdrop-filter:blur(0))]:bg-paper">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Wordmark />

        <nav aria-label="Primary" className="hidden md:block">
          <Suspense fallback={<NavLinksFallback />}>
            <NavLinks />
          </Suspense>
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <p className="label mr-2 hidden max-w-56 items-center gap-2 truncate text-ink-3 xl:flex" title={availability}>
            <span
              aria-hidden="true"
              className={cx("size-1.5 shrink-0 rounded-full", open ? "bg-signal" : "bg-ink-3")}
            />
            <span className="truncate">{availability}</span>
          </p>
          <Link href="/hire" className={cx(buttonClass("primary"), "min-h-10 px-3.5 text-[0.9rem]")}>
            Start a project
            <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
          </Link>
          <ThemeToggle />
        </div>

        <div className="flex items-center gap-1 md:hidden">
          <ThemeToggle />
          <Suspense fallback={null}>
            <MobileMenu availability={availability} />
          </Suspense>
        </div>
      </div>
    </header>
  );
}
