import { afterEach, describe, expect, it, vi } from "vitest";
import { DatabaseConfigError, connectionOptions, databaseUrl, isPooledUrl } from "./connection";

const NEON_POOLED = "postgres://u:p@ep-cool-name-123456-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require";
const NEON_DIRECT = "postgres://u:p@ep-cool-name-123456.eu-central-1.aws.neon.tech/neondb?sslmode=require";

function onlyEnv(vars: Record<string, string>) {
  for (const k of ["DATABASE_URL", "DATABASE_URL_UNPOOLED", "POSTGRES_URL", "POSTGRES_URL_NON_POOLING", "VERCEL", "DATABASE_PREPARE"]) {
    vi.stubEnv(k, undefined);
  }
  for (const [k, v] of Object.entries(vars)) vi.stubEnv(k, v);
}

afterEach(() => vi.unstubAllEnvs());

describe("databaseUrl", () => {
  it("refuses a localhost database on Vercel with instructions", () => {
    onlyEnv({ VERCEL: "1", DATABASE_URL: "postgres://portfolio:portfolio@localhost:5433/portfolio" });
    expect(() => databaseUrl()).toThrow(DatabaseConfigError);
    expect(() => databaseUrl()).toThrow(/Storage → Create Database/);
    onlyEnv({ VERCEL: "1", DATABASE_URL: "postgres://portfolio:portfolio@127.0.0.1:5433/portfolio" });
    expect(() => databaseUrl("migrate")).toThrow(/localhost/);
  });

  it("allows localhost off Vercel", () => {
    onlyEnv({ DATABASE_URL: "postgres://portfolio:portfolio@localhost:5433/portfolio" });
    expect(databaseUrl()).toContain("localhost:5433");
  });

  it("uses the pooled URL for the app and the direct one for migrations", () => {
    onlyEnv({ VERCEL: "1", DATABASE_URL: NEON_POOLED, DATABASE_URL_UNPOOLED: NEON_DIRECT });
    expect(databaseUrl("app")).toBe(NEON_POOLED);
    expect(databaseUrl("migrate")).toBe(NEON_DIRECT);
  });

  it("falls back to the POSTGRES_* names some integrations use", () => {
    onlyEnv({ VERCEL: "1", POSTGRES_URL: NEON_POOLED, POSTGRES_URL_NON_POOLING: NEON_DIRECT });
    expect(databaseUrl("app")).toBe(NEON_POOLED);
    expect(databaseUrl("migrate")).toBe(NEON_DIRECT);
  });

  it("explains a missing database on Vercel", () => {
    onlyEnv({ VERCEL: "1" });
    expect(() => databaseUrl()).toThrow(/No database configured/);
  });
});

describe("connectionOptions", () => {
  it("turns prepared statements off behind a pooler, even if DATABASE_PREPARE says true", () => {
    onlyEnv({ DATABASE_PREPARE: "true" });
    expect(isPooledUrl(NEON_POOLED)).toBe(true);
    expect(isPooledUrl("postgres://u:p@aws-0-eu.pooler.supabase.com:6543/postgres")).toBe(true);
    expect(connectionOptions(NEON_POOLED).prepare).toBe(false);
    expect(connectionOptions(NEON_DIRECT).prepare).toBe(true);
  });
});
