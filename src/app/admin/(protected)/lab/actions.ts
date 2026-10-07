"use server";

import { and, eq, ne } from "drizzle-orm";
import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db/client";
import { logEntries } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/require-admin";
import { TAGS } from "@/lib/cache";
import { fieldErrors, logSchema } from "@/lib/validation";
import type { SaveState } from "../projects/actions";

export async function saveLog(_prev: SaveState, formData: FormData): Promise<SaveState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  let payload: unknown;
  try {
    payload = JSON.parse(String(formData.get("payload") ?? ""));
  } catch {
    return { status: "error", message: "The form data couldn't be read. Reload and try again." };
  }
  const parsed = logSchema.safeParse(payload);
  if (!parsed.success) return { status: "error", message: "Some fields need attention.", errors: fieldErrors(parsed.error) };
  const { publishedAt: dateString, ...data } = parsed.data;

  const clash = await db
    .select({ id: logEntries.id })
    .from(logEntries)
    .where(id ? and(eq(logEntries.slug, data.slug), ne(logEntries.id, id)) : eq(logEntries.slug, data.slug))
    .limit(1);
  if (clash.length) return { status: "error", message: "That slug is already used.", errors: { slug: "Already in use" } };

  const publishedAt = dateString
    ? new Date(`${dateString}T00:00:00Z`)
    : data.visibility === "published"
      ? new Date()
      : null;

  if (id) {
    const result = await db
      .update(logEntries)
      .set({ ...data, publishedAt, updatedAt: new Date() })
      .where(eq(logEntries.id, id))
      .returning({ id: logEntries.id });
    if (!result.length) return { status: "error", message: "This entry no longer exists." };
    updateTag(TAGS.lab);
    return { status: "ok", message: "Saved. The public site is updated.", savedAt: Date.now() };
  }

  const [row] = await db.insert(logEntries).values({ ...data, publishedAt }).returning({ id: logEntries.id });
  updateTag(TAGS.lab);
  redirect(`/admin/lab/${row.id}?created=1`);
}

export async function deleteLog(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (id) await db.delete(logEntries).where(eq(logEntries.id, id));
  updateTag(TAGS.lab);
  redirect("/admin/lab");
}
