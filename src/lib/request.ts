import "server-only";
import { headers } from "next/headers";
import { appSecret } from "./env";
import { hmac } from "./crypto";

/**
 * Client IP from the reverse proxy. Behind Vercel or a correctly configured Nginx/Caddy,
 * the left-most X-Forwarded-For entry is the client. Only ever stored as a salted hash.
 */
export async function clientIpHash(): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = forwarded || h.get("x-real-ip") || "unknown";
  return hmac(appSecret(), `ip:${ip}`).slice(0, 32);
}

export async function userAgent(): Promise<string> {
  return ((await headers()).get("user-agent") ?? "").slice(0, 200);
}
