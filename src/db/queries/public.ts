import "server-only";
import { asc, desc, eq, inArray } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { draftMode } from "next/headers";
import { db } from "@/db/client";
import { logEntries, media, projects, settings, type LogRow, type ProjectRow } from "@/db/schema";
import { TAGS } from "@/lib/cache";
import { DEFAULT_SETTINGS, type SiteSettings } from "@/lib/types";
import { canonicalTool } from "@/content/taxonomy";

// Every public read is cached under a tag and kept until the dashboard expires that tag.
// In Draft Mode (admin preview) the cache is bypassed and drafts are included.

export type PublicProject = Omit<ProjectRow, "needsReview" | "createdAt" | "updatedAt">;
export type PublicLog = Omit<LogRow, "needsReview" | "createdAt" | "updatedAt"> & {
  project: { code: string; slug: string; title: string } | null;
};

/** Drop fields that only matter inside the dashboard. */
function stripInternal<T extends { needsReview: boolean; createdAt: Date; updatedAt: Date }>(row: T) {
  const copy: Partial<T> = { ...row };
  delete copy.needsReview;
  delete copy.createdAt;
  delete copy.updatedAt;
  return copy as Omit<T, "needsReview" | "createdAt" | "updatedAt">;
}

export async function getSettings(): Promise<SiteSettings> {
  "use cache";
  cacheLife("max");
  cacheTag(TAGS.settings);
  const [row] = await db.select().from(settings).where(eq(settings.id, 1)).limit(1);
  return { ...DEFAULT_SETTINGS, ...(row?.data ?? {}) };
}

export async function getProjects(): Promise<PublicProject[]> {
  "use cache";
  cacheLife("max");
  cacheTag(TAGS.projects);
  const { isEnabled: preview } = await draftMode();
  const rows = await db
    .select()
    .from(projects)
    .where(preview ? undefined : eq(projects.visibility, "published"))
    .orderBy(asc(projects.sortOrder), desc(projects.createdAt));
  return rows.map(stripInternal);
}

export async function getProject(slug: string): Promise<PublicProject | null> {
  return (await getProjects()).find((p) => p.slug === slug) ?? null;
}

/** A project earns its own page once its problem has been written up. */
export function hasCaseStudy(p: Pick<PublicProject, "problem" | "stage">): boolean {
  return p.problem.trim().length > 0 && p.stage !== "upcoming";
}

export async function getLogEntries(): Promise<PublicLog[]> {
  "use cache";
  cacheLife("max");
  cacheTag(TAGS.lab, TAGS.projects);
  const { isEnabled: preview } = await draftMode();
  const rows = await db
    .select({
      entry: logEntries,
      project: { code: projects.code, slug: projects.slug, title: projects.title, visibility: projects.visibility },
    })
    .from(logEntries)
    .leftJoin(projects, eq(logEntries.projectId, projects.id))
    .where(preview ? undefined : eq(logEntries.visibility, "published"))
    .orderBy(desc(logEntries.publishedAt), desc(logEntries.createdAt));
  return rows.map(({ entry, project }) => {
    const rest = stripInternal(entry);
    const visible = project && (preview || project.visibility === "published");
    return {
      ...rest,
      project: visible ? { code: project.code, slug: project.slug, title: project.title } : null,
    };
  });
}

export async function getLogEntry(slug: string): Promise<PublicLog | null> {
  return (await getLogEntries()).find((e) => e.slug === slug) ?? null;
}

export type MediaMeta = { id: string; width: number; height: number; alt: string };

export async function getMediaMeta(ids: string[]): Promise<Record<string, MediaMeta>> {
  "use cache";
  cacheLife("max");
  cacheTag(TAGS.media);
  if (ids.length === 0) return {};
  const rows = await db
    .select({ id: media.id, width: media.width, height: media.height, alt: media.alt })
    .from(media)
    .where(inArray(media.id, ids));
  return Object.fromEntries(rows.map((r) => [r.id, r]));
}

export async function getMediaFile(id: string) {
  "use cache";
  cacheLife("max");
  cacheTag(TAGS.media);
  const [row] = await db
    .select({ data: media.data, mime: media.mime })
    .from(media)
    .where(eq(media.id, id))
    .limit(1);
  return row ? { mime: row.mime, data: new Uint8Array(row.data) } : null;
}

export type EvidenceRef = { code: string; href: string; title: string };

/** For each canonical tool name: the published work and lab entries that used it. */
export async function getToolEvidence(): Promise<Record<string, EvidenceRef[]>> {
  const [projectList, logList] = await Promise.all([getProjects(), getLogEntries()]);
  const index: Record<string, EvidenceRef[]> = {};
  const add = (tool: string, ref: EvidenceRef) => {
    const name = canonicalTool(tool);
    if (!name) return;
    const list = (index[name] ??= []);
    if (!list.some((r) => r.code === ref.code)) list.push(ref);
  };
  for (const p of projectList) {
    if (p.visibility !== "published") continue;
    const href = hasCaseStudy(p) ? `/work/${p.slug}` : `/work#${p.slug}`;
    for (const tool of p.stack) add(tool, { code: p.code, href, title: p.title });
  }
  for (const e of logList) {
    if (e.visibility !== "published") continue;
    for (const tag of e.tags) add(tag, { code: e.code, href: `/lab/${e.slug}`, title: e.title });
  }
  return index;
}
