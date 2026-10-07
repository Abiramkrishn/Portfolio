import "server-only";
import { hash, verify } from "@node-rs/argon2";
import { Secret, TOTP } from "otpauth";
import { authEnv } from "@/lib/env";
import { randomToken, safeEqual } from "@/lib/crypto";

// A real argon2id hash of a random string, verified when the email is wrong so a failed
// login costs the same time either way.
let dummyHash: Promise<string> | undefined;
const getDummyHash = () => (dummyHash ??= hash(randomToken()));

export function totpEnabled(): boolean {
  return Boolean(authEnv().ADMIN_TOTP_SECRET);
}

/** Check email + password (+ TOTP when configured). Always does the expensive work. */
export async function checkCredentials(input: {
  email: string;
  password: string;
  code?: string;
}): Promise<boolean> {
  const env = authEnv();
  const emailOk = safeEqual(input.email.trim().toLowerCase(), env.ADMIN_EMAIL.toLowerCase());
  let passwordOk = false;
  try {
    passwordOk = await verify(emailOk ? env.passwordHash : await getDummyHash(), input.password);
  } catch {
    passwordOk = false;
  }
  if (!emailOk || !passwordOk) return false;

  if (env.ADMIN_TOTP_SECRET) {
    const code = (input.code ?? "").replace(/\s+/g, "");
    if (!/^\d{6}$/.test(code)) return false;
    const totp = new TOTP({
      issuer: "Portfolio admin",
      algorithm: "SHA1",
      digits: 6,
      period: 30,
      secret: Secret.fromBase32(env.ADMIN_TOTP_SECRET),
    });
    if (totp.validate({ token: code, window: 1 }) === null) return false;
  }
  return true;
}
