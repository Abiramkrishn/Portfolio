import "server-only";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { rateLimits } from "@/db/schema";

export type RateResult = { ok: boolean; count: number; retryAfterSeconds: number };

/**
 * Fixed-window counter stored in Postgres, so it holds across serverless instances and
 * process restarts. One atomic upsert per hit: resets the window when it has expired.
 */
export async function hit(key: string, limit: number, windowSeconds: number): Promise<RateResult> {
  const [row] = await db
    .insert(rateLimits)
    .values({ key, count: 1 })
    .onConflictDoUpdate({
      target: rateLimits.key,
      set: {
        count: sql`case when ${rateLimits.windowStart} < now() - make_interval(secs => ${windowSeconds}) then 1 else ${rateLimits.count} + 1 end`,
        windowStart: sql`case when ${rateLimits.windowStart} < now() - make_interval(secs => ${windowSeconds}) then now() else ${rateLimits.windowStart} end`,
      },
    })
    .returning({ count: rateLimits.count, windowStart: rateLimits.windowStart });

  const elapsed = (Date.now() - row.windowStart.getTime()) / 1000;
  return {
    ok: row.count <= limit,
    count: row.count,
    retryAfterSeconds: Math.max(0, Math.ceil(windowSeconds - elapsed)),
  };
}

export async function reset(key: string): Promise<void> {
  await db.delete(rateLimits).where(eq(rateLimits.key, key));
}
