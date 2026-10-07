"use server";

import { redirect } from "next/navigation";
import { checkCredentials } from "@/lib/auth/credentials";
import { createSession, destroyAllSessions, destroySession } from "@/lib/auth/session";
import { requireAdmin } from "@/lib/auth/require-admin";
import { clientIpHash, userAgent } from "@/lib/request";
import { hit, reset } from "@/lib/rate-limit";
import { loginSchema } from "@/lib/validation";

export type LoginState = { error?: string; email?: string };

const WINDOW = 15 * 60;

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    code: formData.get("code") ?? undefined,
  });
  const email = String(formData.get("email") ?? "").slice(0, 200);
  if (!parsed.success) return { error: "Email, password or code is incorrect.", email };

  const ipHash = await clientIpHash();
  // Per-IP limit, plus a global ceiling that slows distributed guessing.
  const [perIp, global] = await Promise.all([
    hit(`login:${ipHash}`, 5, WINDOW),
    hit("login:global", 50, WINDOW),
  ]);
  if (!perIp.ok || !global.ok) {
    const minutes = Math.ceil(Math.max(perIp.retryAfterSeconds, global.ok ? 0 : global.retryAfterSeconds) / 60);
    return { error: `Too many attempts. Try again in ${minutes} minute${minutes === 1 ? "" : "s"}.`, email };
  }

  let ok = false;
  try {
    ok = await checkCredentials(parsed.data);
  } catch (err) {
    console.error("[auth]", err instanceof Error ? err.message : err);
    return { error: "The dashboard isn't configured yet. See the README: npm run admin:setup.", email };
  }
  if (!ok) return { error: "Email, password or code is incorrect.", email };

  await reset(`login:${ipHash}`);
  await createSession({ ipHash, userAgent: await userAgent() });
  redirect("/admin");
}

export async function logout(): Promise<void> {
  await destroySession();
  redirect("/admin/login");
}

export async function logoutEverywhere(): Promise<void> {
  await requireAdmin();
  await destroyAllSessions();
  redirect("/admin/login");
}
