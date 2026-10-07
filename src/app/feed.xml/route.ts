import { getLogEntries } from "@/db/queries/public";
import { site } from "@/content/site";
import { siteUrl } from "@/lib/env";

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** RSS 2.0 feed of published lab entries. */
export async function GET() {
  const base = siteUrl();
  const entries = (await getLogEntries()).filter((e) => e.visibility === "published").slice(0, 30);
  const items = entries
    .map(
      (e) => `    <item>
      <title>${esc(`${e.code} · ${e.title}`)}</title>
      <link>${base}/lab/${e.slug}</link>
      <guid isPermaLink="true">${base}/lab/${e.slug}</guid>
      ${e.publishedAt ? `<pubDate>${new Date(e.publishedAt).toUTCString()}</pubDate>` : ""}
      <description>${esc(e.summary || e.title)}</description>
      ${e.tags.map((t) => `<category>${esc(t)}</category>`).join("")}
    </item>`,
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(`${site.name}: Lab`)}</title>
    <link>${base}/lab</link>
    <atom:link href="${base}/feed.xml" rel="self" type="application/rss+xml" />
    <description>Build logs, security work and experiments.</description>
    <language>en</language>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
