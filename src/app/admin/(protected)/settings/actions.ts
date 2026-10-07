"use server";

import { updateTag } from "next/cache";
import { db } from "@/db/client";
import { settings } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/require-admin";
import { TAGS } from "@/lib/cache";
import { fieldErrors, settingsSchema } from "@/lib/validation";
import { sendTestEmail } from "@/lib/mail";

export type SettingsState = { status: "idle" | "ok" | "error"; message?: string; errors?: Record<string, string> };

export async function saveSettings(_prev: SettingsState, formData: FormData): Promise<SettingsState> {
  await requireAdmin();
  const raw = Object.fromEntries(
    [
      "availability",
      "availabilityNote",
      "email",
      "linkedin",
      "github",
      "phone",
      "whatsapp",
      "bookingUrl",
      "cvUrl",
      "location",
      "timezone",
      "now",
      "responseTime",
    ].map((k) => [k, String(formData.get(k) ?? "")]),
  );
  const parsed = settingsSchema.safeParse({ ...raw, notifyOnInquiry: formData.get("notifyOnInquiry") === "on" });
  if (!parsed.success) return { status: "error", message: "Some fields need attention.", errors: fieldErrors(parsed.error) };

  await db
    .insert(settings)
    .values({ id: 1, data: parsed.data })
    .onConflictDoUpdate({ target: settings.id, set: { data: parsed.data, updatedAt: new Date() } });
  updateTag(TAGS.settings);
  return { status: "ok", message: "Saved. Header, footer, about and hire pages are updated." };
}

export type TestEmailState = { status: "idle" | "ok" | "error"; message?: string };

export async function testEmail(): Promise<TestEmailState> {
  await requireAdmin();
  const result = await sendTestEmail();
  return { status: result.ok ? "ok" : "error", message: result.message };
}
