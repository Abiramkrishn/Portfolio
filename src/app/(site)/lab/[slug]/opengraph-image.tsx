import { getLogEntries, getLogEntry } from "@/db/queries/public";
import { KIND_LABEL } from "@/components/lab/log-list";
import { OG_SIZE, ogImage } from "@/lib/og";

export const alt = "Lab entry by Abiram Krishn";
export const size = OG_SIZE;
export const contentType = "image/png";

export async function generateStaticParams() {
  const slugs = (await getLogEntries()).map((e) => ({ slug: e.slug }));
  return slugs.length > 0 ? slugs : [{ slug: "__none__" }];
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const e = await getLogEntry(slug);
  if (!e) return ogImage({ kicker: "Lab", title: "The working notes" });
  return ogImage({ kicker: `${e.code} · ${KIND_LABEL[e.kind]}`, title: e.title, subtitle: e.summary || undefined });
}
