import portrait from "@/assets/abiram-krishn.jpg";
import { site } from "@/content/site";
import { ALL_TOOL_NAMES } from "@/content/taxonomy";
import type { SiteSettings } from "./types";

/** Serialise JSON-LD safely: `<` is escaped so content can never close the script tag. */
export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

export function personSchema(baseUrl: string, settings: SiteSettings) {
  const sameAs = [settings.linkedin, settings.github].filter(Boolean);
  return {
    "@type": "Person",
    "@id": `${baseUrl}/#person`,
    name: site.name,
    url: baseUrl,
    jobTitle: "Software & systems engineer",
    image: `${baseUrl}${portrait.src}`,
    description: site.description,
    knowsAbout: [
      "Software architecture",
      "AI applications",
      "Conversational AI",
      "SaaS development",
      "API integrations",
      "Workflow automation",
      "Application security",
      "Penetration testing",
      ...ALL_TOOL_NAMES,
    ],
    ...(sameAs.length ? { sameAs } : {}),
    ...(settings.email ? { email: `mailto:${settings.email}` } : {}),
    ...(settings.phone ? { telephone: settings.phone.replace(/\s+/g, "") } : {}),
    ...(settings.location ? { address: { "@type": "PostalAddress", addressLocality: settings.location } } : {}),
  };
}

export function websiteSchema(baseUrl: string) {
  return {
    "@type": "WebSite",
    "@id": `${baseUrl}/#website`,
    url: baseUrl,
    name: site.name,
    description: site.description,
    publisher: { "@id": `${baseUrl}/#person` },
    inLanguage: "en",
  };
}

export function breadcrumbs(baseUrl: string, items: { name: string; path: string }[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${baseUrl}${item.path}`,
    })),
  };
}
