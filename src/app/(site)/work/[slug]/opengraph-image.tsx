import { getProject, getProjects, hasCaseStudy } from "@/db/queries/public";
import { OG_SIZE, ogImage } from "@/lib/og";

export const alt = "System file by Abiram Krishn";
export const size = OG_SIZE;
export const contentType = "image/png";

export async function generateStaticParams() {
  const slugs = (await getProjects()).filter(hasCaseStudy).map((p) => ({ slug: p.slug }));
  return slugs.length > 0 ? slugs : [{ slug: "__none__" }];
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = await getProject(slug);
  if (!p) return ogImage({ kicker: "System register", title: "System files" });
  return ogImage({
    kicker: `${p.code} · System file`,
    title: p.title,
    subtitle: p.tagline,
    coverage: p.coverage,
  });
}
