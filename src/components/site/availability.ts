import type { SiteSettings } from "@/lib/types";

export function availabilityLabel(s: Pick<SiteSettings, "availability" | "availabilityNote">): string {
  const base = {
    open: "Available for new projects",
    limited: "Limited availability",
    closed: "Not taking new work right now",
  }[s.availability];
  return s.availabilityNote ? `${base} · ${s.availabilityNote}` : base;
}
