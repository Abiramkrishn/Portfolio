"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { DOMAINS, type DomainKey } from "@/content/taxonomy";
import { cx } from "@/components/ui/primitives";
import { useQueryParam } from "@/components/hooks";

/**
 * Wraps the server-rendered register on /work: domain filter + a preview panel that follows
 * the hovered or focused row. Rows stay server-rendered; this only toggles attributes.
 */
export function RegisterExplorer({
  domains,
  previews,
  initialSlug,
  children,
}: {
  domains: string[];
  previews: Record<string, ReactNode>;
  initialSlug: string | null;
  children: ReactNode;
}) {
  const domainParam = useQueryParam("domain");
  const [chosen, setFilter] = useState<string | null>(null);
  const filter = chosen ?? (domainParam && domains.includes(domainParam) ? domainParam : "all");
  const [active, setActive] = useState<string | null>(initialSlug);
  const listRef = useRef<HTMLDivElement>(null);

  const choose = (d: string) => {
    setFilter(d);
    const url = new URL(window.location.href);
    if (d === "all") url.searchParams.delete("domain");
    else url.searchParams.set("domain", d);
    // Keep the URL shareable without a navigation.
    window.history.replaceState(null, "", url);
  };

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const rows = list.querySelectorAll<HTMLElement>("[data-row]");
    let visible = 0;
    rows.forEach((row) => {
      const show = filter === "all" || (row.dataset.domains ?? "").split(" ").includes(filter);
      row.hidden = !show;
      if (show) visible++;
    });
    list.dataset.empty = visible === 0 ? "true" : "false";
  }, [filter]);

  const track = (e: { target: EventTarget | null }) => {
    const row = (e.target as HTMLElement | null)?.closest<HTMLElement>("[data-slug]");
    if (row?.dataset.slug && previews[row.dataset.slug]) setActive(row.dataset.slug);
  };

  return (
    <div>
      <div role="group" aria-label="Filter by domain" className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 md:mx-0 md:flex-wrap md:px-0">
        {["all", ...domains].map((d) => (
          <button
            key={d}
            type="button"
            aria-pressed={filter === d}
            onClick={() => choose(d)}
            className={cx(
              "mono shrink-0 rounded-[4px] border px-3 py-1.5 text-[0.78rem] transition-colors",
              filter === d ? "border-ink bg-ink text-paper" : "border-rule-strong text-ink-2 hover:border-ink hover:text-ink",
            )}
          >
            {d === "all" ? "All systems" : (DOMAINS[d as DomainKey]?.label ?? d)}
          </button>
        ))}
      </div>

      <div className="mt-10 grid gap-10 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div ref={listRef} onMouseOver={track} onFocus={track} className="group/list">
          {children}
          <p className="hidden py-10 text-ink-3 group-data-[empty=true]/list:block">
            Nothing filed under this domain yet.
          </p>
        </div>
        <aside aria-label="Preview" className="hidden xl:block">
          <div className="sticky top-24">{active ? previews[active] : null}</div>
        </aside>
      </div>
    </div>
  );
}
