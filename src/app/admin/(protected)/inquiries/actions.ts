"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/db/client";
import { inquiries } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/require-admin";
import { inquiryStatusSchema } from "@/lib/validation";

export async function setInquiryStatus(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const status = inquiryStatusSchema.safeParse(formData.get("status"));
  if (!id || !status.success) return;
  await db.update(inquiries).set({ status: status.data }).where(eq(inquiries.id, id));
  revalidatePath("/admin", "layout");
}

export async function deleteInquiry(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (id) await db.delete(inquiries).where(eq(inquiries.id, id));
  redirect("/admin/inquiries");
}
