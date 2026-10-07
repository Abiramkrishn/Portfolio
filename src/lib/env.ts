import "server-only";
import { z } from "zod";

export function siteUrl(): string {
  return (process.env.SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

const authSchema = z.object({
  AUTH_SECRET: z.string().min(32, "AUTH_SECRET must be at least 32 characters"),
  ADMIN_EMAIL: z.email(),
  ADMIN_PASSWORD_HASH_B64: z.string().min(16),
  ADMIN_TOTP_SECRET: z
    .string()
    .optional()
    .transform((v) => (v ? v : undefined)),
});

let authCache: (z.infer<typeof authSchema> & { passwordHash: string }) | undefined;

/** Admin credentials. Throws a readable error if the dashboard isn't configured. */
export function authEnv() {
  if (authCache) return authCache;
  const parsed = authSchema.safeParse(process.env);
  if (!parsed.success) {
    const fields = parsed.error.issues.map((i) => i.path.join(".")).join(", ");
    throw new Error(`Admin is not configured (${fields}). Run \`npm run admin:setup\`.`);
  }
  authCache = {
    ...parsed.data,
    passwordHash: Buffer.from(parsed.data.ADMIN_PASSWORD_HASH_B64, "base64").toString("utf8"),
  };
  return authCache;
}

/** Secret used for HMACs (IP hashing, form tokens). Falls back in development only. */
export function appSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (secret && secret.length >= 32) return secret;
  if (process.env.NODE_ENV === "production") {
    throw new Error("AUTH_SECRET must be set (32+ characters) in production.");
  }
  return "development-only-secret-do-not-use-in-production";
}

export function mailEnv() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM, NOTIFY_EMAIL } = process.env;
  if (!SMTP_HOST || !SMTP_FROM || !NOTIFY_EMAIL) return null;
  // A username without a password (e.g. the App Password not pasted in yet) is not configured.
  if (SMTP_USER && !SMTP_PASS) return null;
  return {
    host: SMTP_HOST,
    port: Number(SMTP_PORT ?? 587),
    user: SMTP_USER,
    // Google shows App Passwords in groups of four; Gmail wants them without the spaces.
    pass: SMTP_HOST === "smtp.gmail.com" ? SMTP_PASS?.replace(/\s+/g, "") : SMTP_PASS,
    from: SMTP_FROM,
    to: NOTIFY_EMAIL,
  };
}
