import "server-only";
import { and, eq, gt, lt, sql } from "drizzle-orm";
import { cookies } from "next/headers";
import { db } from "@/db/client";
import { sessions } from "@/db/schema";
import { randomToken, sha256 } from "@/lib/crypto";

const isProd = process.env.NODE_ENV === "production";
// `__Host-` binds the cookie to this exact origin over HTTPS. Plain name in local dev,
// where some browsers refuse Secure cookies on http://localhost.
export const SESSION_COOKIE = isProd ? "__Host-ak_session" : "ak_session";
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

export async function createSession(meta: { userAgent: string; ipHash: string }): Promise<void> {
  const token = randomToken(32);
  const expiresAt = new Date(Date.now() + SESSION_TTL_SECONDS * 1000);
  await db.delete(sessions).where(lt(sessions.expiresAt, sql`now()`));
  await db.insert(sessions).values({ id: sha256(token), expiresAt, ...meta });
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

/** The current admin session, or null. The cookie alone proves nothing until it matches a row. */
export async function getSession() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token || token.length > 100) return null;
  const [row] = await db
    .select()
    .from(sessions)
    .where(and(eq(sessions.id, sha256(token)), gt(sessions.expiresAt, sql`now()`)))
    .limit(1);
  return row ?? null;
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) await db.delete(sessions).where(eq(sessions.id, sha256(token)));
  store.delete(SESSION_COOKIE);
}

export async function destroyAllSessions(): Promise<void> {
  await db.delete(sessions);
  (await cookies()).delete(SESSION_COOKIE);
}
