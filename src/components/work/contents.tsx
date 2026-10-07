"use client";

import { useEffect, useState } from "react";
import { cx } from "@/components/ui/primitives";

export type ContentsItem = { id: string; label: string };

/** Sticky table of contents with scroll-spy. Desktop: margin rail. Mobile: "jump to" bar. */
export function Contents({ items }: { items: ContentsItem[] }) {
  const [active, setActive] = useState(items[0]?.id);

  useEffect(() => {
    const sections = items
      .map((i) => document.getElementById(i.id))
      .filter((el): el is HTMLElement => Boolean(el));
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-20% 0px -65% 0px" },
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [items]);

  const current = items.find((i) => i.id === active) ?? items[0];
  const index = Math.max(0, items.indexOf(current));

  return (
    <>
      <nav aria-label="Contents" className="hidden lg:block">
        <p className="label text-ink-3">Contents</p>
        <ol className="mt-4 border-l border-rule">
          {items.map((item, i) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                aria-current={item.id === active ? "location" : undefined}
                className={cx(
                  "-ml-px flex gap-3 border-l py-1.5 pl-4 text-[0.9rem] transition-colors",
                  item.id === active ? "border-signal text-ink" : "border-transparent text-ink-3 hover:text-ink",
                )}
              >
                <span className="label pt-[0.2rem] text-signal-ink">{String(i + 1).padStart(2, "0")}</span>
                {item.label}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <details className="disclosure group sticky top-16 z-30 -mx-4 border-b border-rule bg-paper/95 px-4 backdrop-blur lg:hidden">
        <summary className="flex min-h-12 items-center justify-between gap-3">
          <span className="label text-ink-3">
            <span className="text-signal-ink">{String(index + 1).padStart(2, "0")}</span> · {current?.label}
          </span>
          <span className="label text-ink-2">Jump to</span>
        </summary>
        <ol className="pb-3">
          {items.map((item, i) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                onClick={(e) => (e.currentTarget.closest("details") as HTMLDetailsElement | null)?.removeAttribute("open")}
                className="flex gap-3 py-2 text-[0.95rem] text-ink-2"
              >
                <span className="label pt-[0.2rem] text-signal-ink">{String(i + 1).padStart(2, "0")}</span>
                {item.label}
              </a>
            </li>
          ))}
        </ol>
      </details>
    </>
  );
}
