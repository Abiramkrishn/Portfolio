// Which database to connect to, and how. Shared by the app, migrations and the seed script.

export class DatabaseConfigError extends Error {}

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1", "[::1]", "0.0.0.0"]);

function hostOf(url: string): { host: string; port: string } {
  try {
    const u = new URL(url);
    return { host: u.hostname, port: u.port };
  } catch {
    throw new DatabaseConfigError("DATABASE_URL isn't a valid connection string (postgres://user:pass@host:port/db).");
  }
}

/**
 * The connection string. The app prefers the pooled URL; migrations prefer a direct one
 * (Vercel's Neon/Supabase integrations provide both).
 */
export function databaseUrl(purpose: "app" | "migrate" = "app"): string {
  const env = process.env;
  const url =
    purpose === "migrate"
      ? env.DATABASE_URL_UNPOOLED || env.POSTGRES_URL_NON_POOLING || env.DATABASE_URL || env.POSTGRES_URL
      : env.DATABASE_URL || env.POSTGRES_URL;
  if (!url) {
    throw new DatabaseConfigError(
      env.VERCEL
        ? "No database configured. In Vercel: Storage → Create Database → Neon, connect it to this project, then redeploy."
        : "DATABASE_URL is not set. Copy .env.example to .env and start Postgres (docker compose up -d db).",
    );
  }
  // A hosted build can't reach a database on someone's own computer.
  if (env.VERCEL && LOCAL_HOSTS.has(hostOf(url).host)) {
    throw new DatabaseConfigError(
      "DATABASE_URL points to localhost, which Vercel can't reach (it's the database on your own computer). " +
        "Delete that DATABASE_URL in Vercel → Settings → Environment Variables, then add a hosted database: " +
        "Storage → Create Database → Neon → connect it to this project, and redeploy.",
    );
  }
  return url;
}

/** Transaction-mode poolers (Neon "-pooler" hosts, Supabase :6543, PgBouncer) can't use prepared statements. */
export function isPooledUrl(url: string): boolean {
  const { host, port } = hostOf(url);
  return host.includes("-pooler") || port === "6543" || /[?&]pgbouncer=true/.test(url);
}

export function connectionOptions(url: string) {
  return {
    max: Number(process.env.DATABASE_POOL_MAX ?? 5),
    prepare: !isPooledUrl(url) && process.env.DATABASE_PREPARE !== "false",
    idle_timeout: 20,
    onnotice: () => {},
  };
}
