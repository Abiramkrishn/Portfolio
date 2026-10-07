// Apply pending SQL migrations from src/db/migrations. Usage: npm run db:migrate
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { db, sql } from "./client";

migrate(db, { migrationsFolder: "src/db/migrations" })
  .then(() => console.log("Migrations applied."))
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => sql.end());
