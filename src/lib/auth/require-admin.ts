import "server-only";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { getSession } from "./session";

/**
 * The real authorisation check. The proxy only does an optimistic cookie-presence redirect;
 * every dashboard page, server action and route handler calls this itself.
 */
export async function requireAdmin() {
  await connection();
  const session = await getSession();
  if (!session) redirect("/admin/login");
  return session;
}
