// Apply pending SQL migrations from src/db/migrations. Usage: npm run db:migrate
// Uses a direct (unpooled) connection when one is available.
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import { DatabaseConfigError, connectionOptions, databaseUrl } from "./connection";

async function main() {
  const url = databaseUrl("migrate");
  const sql = postgres(url, { ...connectionOptions(url), max: 1 });
  try {
    await migrate(drizzle(sql), { migrationsFolder: "src/db/migrations" });
    console.log("Migrations applied.");
  } finally {
    await sql.end();
  }
}

main().catch((err) => {
  console.error(err instanceof DatabaseConfigError ? `\n✗ ${err.message}\n` : err);
  process.exitCode = 1;
});
