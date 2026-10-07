import "server-only";
import { appSecret } from "./env";
import { sign, unsign } from "./crypto";

const MIN_AGE_MS = 3_000;
const MAX_AGE_MS = 2 * 60 * 60 * 1000;

/** A signed timestamp handed to the brief form when it loads. */
export function issueFormToken(now = Date.now()): string {
  return sign(appSecret(), `brief:${now}`);
}

/**
 * Valid only if we issued it, at least a few seconds ago (people read before they type)
 * and within the last two hours.
 */
export function checkFormToken(token: string, now = Date.now()): "ok" | "invalid" | "too-fast" | "expired" {
  const value = unsign(appSecret(), token);
  if (!value?.startsWith("brief:")) return "invalid";
  const issued = Number(value.slice(6));
  if (!Number.isFinite(issued)) return "invalid";
  const age = now - issued;
  if (age < MIN_AGE_MS) return "too-fast";
  if (age > MAX_AGE_MS) return "expired";
  return "ok";
}
