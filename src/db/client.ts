import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import { connectionOptions, databaseUrl } from "./connection";

type Sql = ReturnType<typeof postgres>;

const globalForDb = globalThis as unknown as { __pg?: Sql };

function connect(): Sql {
  const url = databaseUrl("app");
  return postgres(url, connectionOptions(url));
}

// Reuse one pool across hot reloads in development.
const sql = globalForDb.__pg ?? connect();
if (process.env.NODE_ENV !== "production") globalForDb.__pg = sql;

export const db = drizzle(sql, { schema });
export { sql };
