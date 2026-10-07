import { hash } from "@node-rs/argon2";
import { Secret, TOTP } from "otpauth";
import { beforeAll, describe, expect, it } from "vitest";

const secret = new Secret({ size: 20 });
const totp = new TOTP({ algorithm: "SHA1", digits: 6, period: 30, secret });
let checkCredentials: typeof import("./credentials").checkCredentials;

beforeAll(async () => {
  process.env.AUTH_SECRET = "x".repeat(40);
  process.env.ADMIN_EMAIL = "owner@example.com";
  process.env.ADMIN_PASSWORD_HASH_B64 = Buffer.from(await hash("correct horse battery")).toString("base64");
  process.env.ADMIN_TOTP_SECRET = secret.base32;
  ({ checkCredentials } = await import("./credentials"));
});

describe("checkCredentials", () => {
  it("accepts the right email, password and current code", async () => {
    expect(await checkCredentials({ email: "Owner@Example.com ", password: "correct horse battery", code: totp.generate() })).toBe(true);
  });

  it("rejects a wrong password, a wrong email, or a missing/wrong code", async () => {
    const code = totp.generate();
    expect(await checkCredentials({ email: "owner@example.com", password: "nope", code })).toBe(false);
    expect(await checkCredentials({ email: "someone@else.com", password: "correct horse battery", code })).toBe(false);
    expect(await checkCredentials({ email: "owner@example.com", password: "correct horse battery" })).toBe(false);
    const wrong = String((Number(code) + 500_000) % 1_000_000).padStart(6, "0");
    expect(await checkCredentials({ email: "owner@example.com", password: "correct horse battery", code: wrong })).toBe(false);
  });
});
