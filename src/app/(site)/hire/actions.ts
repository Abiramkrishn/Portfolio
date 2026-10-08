"use server";

import { after } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { inquiries } from "@/db/schema";
import { getSettings } from "@/db/queries/public";
import { briefSchema, fieldErrors } from "@/lib/validation";
import { checkFormToken } from "@/lib/form-token";
import { clientIpHash } from "@/lib/request";
import { hit } from "@/lib/rate-limit";
import { explainMailError, notifyNewInquiry } from "@/lib/mail";
import type { EmailStatus } from "@/lib/types";

export type BriefState = {
  status: "idle" | "ok" | "error";
  message?: string;
  errors?: Record<string, string>;
  values?: Record<string, string | string[]>;
};

export async function submitBrief(_prev: BriefState, formData: FormData): Promise<BriefState> {
  const raw = {
    engagements: formData.getAll("engagements").map(String),
    currentState: String(formData.get("currentState") ?? ""),
    message: String(formData.get("message") ?? ""),
    timeline: String(formData.get("timeline") ?? ""),
    budget: String(formData.get("budget") ?? ""),
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    company: String(formData.get("company") ?? ""),
  };

  // Honeypot: real people never see this field. Pretend success so bots learn nothing.
  if (String(formData.get("website") ?? "").trim() !== "") return { status: "ok" };

  const token = checkFormToken(String(formData.get("token") ?? ""));
  if (token === "too-fast") return { status: "ok" };
  if (token !== "ok") {
    return {
      status: "error",
      message: "This form expired. Reload the page and send it again. Your text is kept below.",
      values: raw,
    };
  }

  const parsed = briefSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      status: "error",
      message: "A couple of fields need another look.",
      errors: fieldErrors(parsed.error),
      values: raw,
    };
  }

  const ipHash = await clientIpHash();
  const limit = await hit(`brief:${ipHash}`, 5, 60 * 60);
  if (!limit.ok) {
    return {
      status: "error",
      message: `Too many briefs from this connection. Try again in ${Math.ceil(limit.retryAfterSeconds / 60)} minutes, or email directly.`,
      values: raw,
    };
  }

  const [row] = await db
    .insert(inquiries)
    .values({ ...parsed.data, ipHash })
    .returning({ id: inquiries.id });

  // Email after the response, so the visitor never waits on the mail server.
  after(async () => {
    let result: { status: EmailStatus; error?: string };
    try {
      const settings = await getSettings();
      result = settings.notifyOnInquiry ? await notifyNewInquiry(row.id, parsed.data) : { status: "off" };
    } catch (err) {
      console.error("[mail] notification step failed:", err);
      result = { status: "failed", error: explainMailError(err) };
    }
    await db
      .update(inquiries)
      .set({ emailStatus: result.status, emailError: result.error ?? "" })
      .where(eq(inquiries.id, row.id));
  });

  return { status: "ok" };
}
