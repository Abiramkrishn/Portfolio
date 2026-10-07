import type { SiteSettings } from "@/lib/types";

export type ContactLink = { label: string; value: string; href: string; external: boolean };

/** Only the channels that have been filled in, in order of directness. */
export function contactLinks(s: SiteSettings): ContactLink[] {
  const links: ContactLink[] = [];
  if (s.email) links.push({ label: "Email", value: s.email, href: `mailto:${s.email}`, external: false });
  if (s.phone) {
    const digits = s.phone.replace(/[^0-9+]/g, "");
    links.push({ label: "Phone", value: s.phone, href: `tel:${digits}`, external: false });
  }
  if (s.whatsapp) {
    const digits = s.whatsapp.replace(/[^0-9]/g, "");
    links.push({ label: "WhatsApp", value: s.whatsapp, href: `https://wa.me/${digits}`, external: true });
  }
  if (s.linkedin) links.push({ label: "LinkedIn", value: prettyUrl(s.linkedin), href: s.linkedin, external: true });
  if (s.github) links.push({ label: "GitHub", value: prettyUrl(s.github), href: s.github, external: true });
  if (s.bookingUrl) links.push({ label: "Book a call", value: prettyUrl(s.bookingUrl), href: s.bookingUrl, external: true });
  return links;
}

function prettyUrl(url: string) {
  return url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
}
