import { eq } from "drizzle-orm";
import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/db/client";
import { logEntries, projects } from "@/db/schema";
import { getSession } from "@/lib/auth/session";

const UUID = /^[0-9a-f-]{36}$/i;

/**
 * Turns on Draft Mode for the signed-in owner and opens the real public page, drafts included.
 * The redirect target comes from the database, never from the query string (no open redirect).
 */
export async function GET(request: Request) {
  if (!(await getSession())) return new Response("Not signed in", { status: 401 });
  const params = new URL(request.url).searchParams;
  const projectId = params.get("project");
  const labId = params.get("lab");

  let target: string | null = null;
  if (projectId && UUID.test(projectId)) {
    const [p] = await db.select({ slug: projects.slug }).from(projects).where(eq(projects.id, projectId)).limit(1);
    if (p) target = `/work/${p.slug}`;
  } else if (labId && UUID.test(labId)) {
    const [e] = await db.select({ slug: logEntries.slug }).from(logEntries).where(eq(logEntries.id, labId)).limit(1);
    if (e) target = `/lab/${e.slug}`;
  }
  if (!target) return new Response("Not found", { status: 404 });

  (await draftMode()).enable();
  redirect(target);
}
