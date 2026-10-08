import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

// authEnv caches its result, so each case loads a fresh copy of the module.
const load = () => import("./env");

function admin(email: string) {
  vi.stubEnv("ADMIN_EMAIL", email);
  vi.stubEnv("ADMIN_PASSWORD_HASH_B64", Buffer.from("$argon2id$v=19$placeholder").toString("base64"));
  vi.stubEnv("AUTH_SECRET", "x".repeat(40));
  vi.stubEnv("ADMIN_TOTP_SECRET", "");
}

describe("siteUrl", () => {
  it("ignores a localhost SITE_URL on Vercel and uses the production domain", async () => {
    vi.stubEnv("VERCEL", "1");
    vi.stubEnv("SITE_URL", "http://localhost:3000");
    vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "portfolio-abc.vercel.app");
    expect((await load()).siteUrl()).toBe("https://portfolio-abc.vercel.app");
  });

  it("keeps an explicit domain and drops a trailing slash", async () => {
    vi.stubEnv("VERCEL", "1");
    vi.stubEnv("SITE_URL", "https://abiramkrishn.com/");
    vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "portfolio-abc.vercel.app");
    expect((await load()).siteUrl()).toBe("https://abiramkrishn.com");
  });
});

describe("authEnv", () => {
  it("refuses the placeholder admin email on a live deployment", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("SITE_URL", "https://abiramkrishn.com");
    admin("owner@example.com");
    await expect(load().then((m) => m.authEnv())).rejects.toThrow(/placeholder/);
  });

  it("accepts it for a local production build, and a real email anywhere", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("SITE_URL", "http://localhost:3000");
    admin("owner@example.com");
    expect((await load()).authEnv().ADMIN_EMAIL).toBe("owner@example.com");
    vi.resetModules();
    vi.stubEnv("SITE_URL", "https://abiramkrishn.com");
    admin("abiramkrishn@gmail.com");
    expect((await load()).authEnv().ADMIN_EMAIL).toBe("abiramkrishn@gmail.com");
  });
});
