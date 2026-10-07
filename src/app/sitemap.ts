import type { MetadataRoute } from "next";
import { getLogEntries, getProjects, hasCaseStudy } from "@/db/queries/public";
import { siteUrl } from "@/lib/env";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const [projects, log] = await Promise.all([getProjects(), getLogEntries()]);
  const fixed = ["", "/work", "/lab", "/about", "/hire"].map((path) => ({
    url: `${base}${path}`,
    changeFrequency: "monthly" as const,
    priority: path === "" ? 1 : 0.8,
  }));
  const work = projects
    .filter((p) => p.visibility === "published" && hasCaseStudy(p))
    .map((p) => ({
      url: `${base}/work/${p.slug}`,
      ...(p.publishedAt ? { lastModified: new Date(p.publishedAt) } : {}),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));
  const entries = log
    .filter((e) => e.visibility === "published")
    .map((e) => ({
      url: `${base}/lab/${e.slug}`,
      ...(e.publishedAt ? { lastModified: new Date(e.publishedAt) } : {}),
      changeFrequency: "yearly" as const,
      priority: 0.5,
    }));
  return [...fixed, ...work, ...entries];
}
