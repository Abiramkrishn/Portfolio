"use server";

import { eq } from "drizzle-orm";
import { updateTag } from "next/cache";
import { revalidatePath } from "next/cache";
import { db } from "@/db/client";
import { media } from "@/db/schema";
import { mediaUsage } from "@/db/queries/admin";
import { requireAdmin } from "@/lib/auth/require-admin";
import { TAGS } from "@/lib/cache";
import { MediaError, processImage } from "@/lib/media";

export type UploadState = { status: "idle" | "ok" | "error"; message?: string };

export async function uploadMedia(_prev: UploadState, formData: FormData): Promise<UploadState> {
  await requireAdmin();
  const file = formData.get("file");
  const alt = String(formData.get("alt") ?? "").trim().slice(0, 300);
  if (!(file instanceof File) || file.size === 0) return { status: "error", message: "Choose an image to upload." };
  if (!alt) return { status: "error", message: "Describe the image (alt text). It's read aloud to screen-reader users." };

  try {
    const img = await processImage(Buffer.from(await file.arrayBuffer()));
    await db
      .insert(media)
      .values({
        id: img.id,
        filename: file.name.slice(0, 200),
        mime: img.mime,
        width: img.width,
        height: img.height,
        size: img.size,
        alt,
        data: img.data,
      })
      .onConflictDoUpdate({ target: media.id, set: { alt } });
  } catch (err) {
    if (err instanceof MediaError) return { status: "error", message: err.message };
    console.error("[media]", err);
    return { status: "error", message: "The image couldn't be processed." };
  }
  updateTag(TAGS.media);
  revalidatePath("/admin/media");
  return { status: "ok", message: "Uploaded. Metadata stripped, re-encoded as WebP." };
}

export async function updateAlt(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const alt = String(formData.get("alt") ?? "").trim().slice(0, 300);
  if (!id || !alt) return;
  await db.update(media).set({ alt }).where(eq(media.id, id));
  updateTag(TAGS.media);
  revalidatePath("/admin/media");
}

export async function deleteMedia(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const usedBy = await mediaUsage(id);
  if (usedBy.length > 0) return; // the UI hides delete for images in use; this is the enforcement
  await db.delete(media).where(eq(media.id, id));
  updateTag(TAGS.media);
  revalidatePath("/admin/media");
}
