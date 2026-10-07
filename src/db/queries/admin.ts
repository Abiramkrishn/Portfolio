import "server-only";
import { asc, count, desc, eq, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { inquiries, logEntries, media, projects, settings } from "@/db/schema";
import { DEFAULT_SETTINGS, type SiteSettings } from "@/lib/types";

// Uncached reads for the dashboard. Every caller is behind requireAdmin().

export async function adminCounts() {
  const [p] = await db
    .select({
      total: count(),
      published: sql<number>`count(*) filter (where ${projects.visibility} = 'published')`,
      drafts: sql<number>`count(*) filter (where ${projects.visibility} = 'draft')`,
      upcoming: sql<number>`count(*) filter (where ${projects.stage} = 'upcoming')`,
      review: sql<number>`count(*) filter (where ${projects.needsReview})`,
    })
    .from(projects);
  const [l] = await db
    .select({
      total: count(),
      published: sql<number>`count(*) filter (where ${logEntries.visibility} = 'published')`,
      review: sql<number>`count(*) filter (where ${logEntries.needsReview})`,
    })
    .from(logEntries);
  const [i] = await db
    .select({ total: count(), fresh: sql<number>`count(*) filter (where ${inquiries.status} = 'new')` })
    .from(inquiries);
  const [m] = await db.select({ total: count() }).from(media);
  return {
    projects: { ...p, published: Number(p.published), drafts: Number(p.drafts), upcoming: Number(p.upcoming), review: Number(p.review) },
    lab: { ...l, published: Number(l.published), review: Number(l.review) },
    inquiries: { total: i.total, fresh: Number(i.fresh) },
    media: m.total,
  };
}

export async function listProjectsAdmin() {
  return db.select().from(projects).orderBy(asc(projects.sortOrder), desc(projects.createdAt));
}

export async function getProjectAdmin(id: string) {
  const [row] = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
  return row ?? null;
}

export async function nextCode(kind: "SYS" | "LOG") {
  const table = kind === "SYS" ? projects : logEntries;
  const rows = await db.select({ code: table.code }).from(table);
  const max = rows.reduce((m, r) => {
    const n = Number(r.code.replace(/\D/g, ""));
    return Number.isFinite(n) && n > m ? n : m;
  }, 0);
  return `${kind}-${String(max + 1).padStart(3, "0")}`;
}

export async function listLogAdmin() {
  return db
    .select({ entry: logEntries, projectCode: projects.code })
    .from(logEntries)
    .leftJoin(projects, eq(logEntries.projectId, projects.id))
    .orderBy(desc(logEntries.publishedAt), desc(logEntries.createdAt));
}

export async function getLogAdmin(id: string) {
  const [row] = await db.select().from(logEntries).where(eq(logEntries.id, id)).limit(1);
  return row ?? null;
}

export async function projectOptions() {
  return db
    .select({ id: projects.id, code: projects.code, title: projects.title })
    .from(projects)
    .orderBy(asc(projects.sortOrder));
}

export async function listInquiries() {
  return db.select().from(inquiries).orderBy(desc(inquiries.createdAt));
}

export async function getInquiry(id: string) {
  const [row] = await db.select().from(inquiries).where(eq(inquiries.id, id)).limit(1);
  return row ?? null;
}

export async function listMedia() {
  return db
    .select({
      id: media.id,
      filename: media.filename,
      width: media.width,
      height: media.height,
      size: media.size,
      alt: media.alt,
      createdAt: media.createdAt,
    })
    .from(media)
    .orderBy(desc(media.createdAt));
}

/** Projects that reference a media item, so it can't be deleted out from under them. */
export async function mediaUsage(id: string) {
  const rows = await db
    .select({ code: projects.code, title: projects.title })
    .from(projects)
    .where(
      sql`${projects.coverMediaId} = ${id} or exists (select 1 from jsonb_array_elements(${projects.evidence}) e where e->>'mediaId' = ${id})`,
    );
  return rows;
}

export async function getSettingsAdmin(): Promise<SiteSettings> {
  const [row] = await db.select().from(settings).where(eq(settings.id, 1)).limit(1);
  return { ...DEFAULT_SETTINGS, ...(row?.data ?? {}) };
}
