import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

type Sql = ReturnType<typeof postgres>;

const globalForDb = globalThis as unknown as { __pg?: Sql };

function connect(): Sql {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set. Copy .env.example to .env and start Postgres.");
  }
  return postgres(url, {
    max: Number(process.env.DATABASE_POOL_MAX ?? 5),
    // Transaction-mode poolers (Neon, Supabase, PgBouncer) don't support prepared statements.
    prepare: process.env.DATABASE_PREPARE !== "false",
    idle_timeout: 20,
    onnotice: () => {},
  });
}

// Reuse one pool across hot reloads in development.
const sql = globalForDb.__pg ?? connect();
if (process.env.NODE_ENV !== "production") globalForDb.__pg = sql;

export const db = drizzle(sql, { schema });
export { sql };
