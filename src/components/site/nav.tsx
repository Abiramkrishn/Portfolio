"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { cx } from "@/components/ui/primitives";
import { ArrowRight, Close, Menu } from "@/components/ui/icons";

export const NAV = [
  { href: "/work", label: "Work" },
  { href: "/lab", label: "Lab" },
  { href: "/about", label: "About" },
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function NavLinks() {
  const pathname = usePathname();
  return (
    <ul className="flex items-center gap-1">
      {NAV.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cx(
                "relative inline-flex min-h-10 items-center px-3 text-[0.95rem] transition-colors",
                active ? "text-ink" : "text-ink-2 hover:text-ink",
              )}
            >
              {item.label}
              {active ? <span aria-hidden="true" className="absolute inset-x-3 bottom-1.5 h-px bg-signal" /> : null}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function NavLinksFallback() {
  return (
    <ul className="flex items-center gap-1">
      {NAV.map((item) => (
        <li key={item.href}>
          <Link href={item.href} className="inline-flex min-h-10 items-center px-3 text-[0.95rem] text-ink-2">
            {item.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** Mobile menu: a full-screen native dialog (focus trap, Esc to close, inert page behind). */
export function MobileMenu({ availability }: { availability: string }) {
  const ref = useRef<HTMLDialogElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    ref.current?.close();
  }, [pathname]);

  return (
    <>
      <button
        type="button"
        onClick={() => ref.current?.showModal()}
        className="mono inline-flex min-h-10 items-center gap-2 rounded-[4px] border border-rule-strong px-3 text-[0.8rem] text-ink"
        aria-haspopup="dialog"
      >
        <Menu />
        Menu
      </button>
      <dialog
        ref={ref}
        aria-label="Site menu"
        className="m-0 h-dvh max-h-none w-full max-w-none bg-paper p-0 text-ink backdrop:bg-ink/30"
        onClick={(e) => {
          if (e.target === e.currentTarget) ref.current?.close();
        }}
      >
        <div className="container-page flex h-full flex-col py-4">
          <div className="flex items-center justify-between">
            <span className="label text-ink-3">Menu</span>
            <button
              type="button"
              onClick={() => ref.current?.close()}
              className="mono inline-flex min-h-10 items-center gap-2 rounded-[4px] border border-rule-strong px-3 text-[0.8rem]"
            >
              <Close />
              Close
            </button>
          </div>
          <nav aria-label="Primary" className="mt-10">
            <ol className="border-t border-rule">
              {[{ href: "/", label: "Home" }, ...NAV, { href: "/hire", label: "Hire" }].map((item, i) => (
                <li key={item.href} className="border-b border-rule">
                  <Link
                    href={item.href}
                    onClick={() => ref.current?.close()}
                    aria-current={pathname === item.href ? "page" : undefined}
                    className="flex items-baseline gap-4 py-4"
                  >
                    <span className="label w-6 text-signal-ink">{String(i).padStart(2, "0")}</span>
                    <span className="headline">{item.label}</span>
                  </Link>
                </li>
              ))}
            </ol>
          </nav>
          <div className="mt-auto space-y-4 pb-4">
            <p className="label flex items-center gap-2 text-ink-2">
              <span aria-hidden="true" className="size-1.5 rounded-full bg-signal" />
              {availability}
            </p>
            <Link
              href="/hire"
              onClick={() => ref.current?.close()}
              className="flex min-h-12 items-center justify-between rounded-[4px] bg-ink px-4 text-paper"
            >
              Start a project
              <ArrowRight />
            </Link>
          </div>
        </div>
      </dialog>
    </>
  );
}
