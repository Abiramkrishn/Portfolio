"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cx } from "@/components/ui/primitives";

const ITEMS = [
  { href: "/admin", label: "Overview", exact: true },
  { href: "/admin/projects", label: "Projects" },
  { href: "/admin/lab", label: "Lab" },
  { href: "/admin/inquiries", label: "Inquiries" },
  { href: "/admin/media", label: "Media" },
  { href: "/admin/settings", label: "Settings" },
];

export function AdminNav({ newInquiries }: { newInquiries: number }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Dashboard">
      <ul className="-mx-1 flex gap-1 overflow-x-auto lg:mx-0 lg:flex-col">
        {ITEMS.map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <li key={item.href} className="shrink-0">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cx(
                  "flex items-center justify-between gap-3 rounded-[4px] px-3 py-2 text-[0.92rem] transition-colors",
                  active ? "bg-ink text-paper" : "text-ink-2 hover:bg-card hover:text-ink",
                )}
              >
                {item.label}
                {item.href === "/admin/inquiries" && newInquiries > 0 ? (
                  <span className="mono rounded-full bg-signal px-1.5 text-[0.7rem] text-white">
                    {newInquiries}
                    <span className="sr-only"> new</span>
                  </span>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
