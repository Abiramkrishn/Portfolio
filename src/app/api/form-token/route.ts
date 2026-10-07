import { connection } from "next/server";
import { issueFormToken } from "@/lib/form-token";

export async function GET() {
  await connection();
  return Response.json(
    { token: issueFormToken() },
    { headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" } },
  );
}
