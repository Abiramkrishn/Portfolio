"use server";

import { and, asc, eq, ne } from "drizzle-orm";
import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db/client";
import { projects } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/require-admin";
import { TAGS } from "@/lib/cache";
import { fieldErrors, projectSchema } from "@/lib/validation";

export type SaveState = {
  status: "idle" | "ok" | "error";
  message?: string;
  errors?: Record<string, string>;
  savedAt?: number;
};

export async function saveProject(_prev: SaveState, formData: FormData): Promise<SaveState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");

  let payload: unknown;
  try {
    payload = JSON.parse(String(formData.get("payload") ?? ""));
  } catch {
    return { status: "error", message: "The form data couldn't be read. Reload and try again." };
  }
  const parsed = projectSchema.safeParse(payload);
  if (!parsed.success) {
    return { status: "error", message: "Some fields need attention.", errors: fieldErrors(parsed.error) };
  }
  const data = parsed.data;

  // Diagram integrity: unique ids, and connections only between components that exist.
  const ids = data.diagram.nodes.map((n) => n.id);
  if (new Set(ids).size !== ids.length) {
    return { status: "error", message: "Two diagram components share an id.", errors: { "diagram.nodes": "Duplicate id" } };
  }
  data.diagram.edges = data.diagram.edges.filter((e) => ids.includes(e.from) && ids.includes(e.to) && e.from !== e.to);

  const clash = await db
    .select({ id: projects.id })
    .from(projects)
    .where(id ? and(eq(projects.slug, data.slug), ne(projects.id, id)) : eq(projects.slug, data.slug))
    .limit(1);
  if (clash.length) return { status: "error", message: "That slug is already used.", errors: { slug: "Already in use" } };

  const existing = id ? (await db.select().from(projects).where(eq(projects.id, id)).limit(1))[0] : undefined;
  if (id && !existing) return { status: "error", message: "This project no longer exists." };
  const publishedAt =
    data.visibility === "published" ? (existing?.publishedAt ?? new Date()) : (existing?.publishedAt ?? null);

  let savedId = id;
  if (existing) {
    await db.update(projects).set({ ...data, publishedAt, updatedAt: new Date() }).where(eq(projects.id, id));
  } else {
    const [row] = await db.insert(projects).values({ ...data, publishedAt }).returning({ id: projects.id });
    savedId = row.id;
  }

  updateTag(TAGS.projects);
  if (!existing) redirect(`/admin/projects/${savedId}?created=1`);
  return { status: "ok", message: "Saved. The public site is updated.", savedAt: Date.now() };
}

export async function deleteProject(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (id) await db.delete(projects).where(eq(projects.id, id));
  updateTag(TAGS.projects);
  redirect("/admin/projects");
}

/** Move a project one place up or down in the register. */
export async function moveProject(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const dir = formData.get("dir") === "up" ? -1 : 1;
  const list = await db.select({ id: projects.id }).from(projects).orderBy(asc(projects.sortOrder), asc(projects.createdAt));
  const i = list.findIndex((p) => p.id === id);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= list.length) return;
  [list[i], list[j]] = [list[j], list[i]];
  await db.transaction(async (tx) => {
    for (let k = 0; k < list.length; k++) {
      await tx.update(projects).set({ sortOrder: k + 1 }).where(eq(projects.id, list[k].id));
    }
  });
  updateTag(TAGS.projects);
}
