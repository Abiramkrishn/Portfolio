// Seed initial content. Idempotent: existing rows (matched by slug) are left alone.
// Usage: npm run db:seed
//        npm run db:seed -- --bootstrap   only seeds an empty database (used by deploys)
import { db, sql } from "./client";
import { DatabaseConfigError } from "./connection";
import { eq } from "drizzle-orm";
import { logEntries, projects, settings } from "./schema";
import { seedLog, seedProjects } from "./seed-data";

async function main() {
  if (process.argv.includes("--bootstrap")) {
    // The settings row is written last, so its presence means a seed has completed before.
    const [existing] = await db.select({ id: settings.id }).from(settings).limit(1);
    if (existing) {
      console.log("Database already has content; skipping seed.");
      return;
    }
  }

  const insertedProjects = await db
    .insert(projects)
    .values(seedProjects)
    .onConflictDoNothing({ target: projects.slug })
    .returning({ slug: projects.slug });

  // Resolve each entry's related project by slug.
  const logRows = await Promise.all(
    seedLog.map(async ({ projectSlug, ...entry }) => {
      if (!projectSlug) return entry;
      const [p] = await db.select({ id: projects.id }).from(projects).where(eq(projects.slug, projectSlug)).limit(1);
      return { ...entry, projectId: p?.id ?? null };
    }),
  );

  const insertedLog = await db
    .insert(logEntries)
    .values(logRows)
    .onConflictDoNothing({ target: logEntries.slug })
    .returning({ slug: logEntries.slug });

  await db
    .insert(settings)
    .values({
      id: 1,
      data: {
        email: "abiramkrishn@gmail.com",
        phone: "+91 88484 07572",
        location: "Kozhikode, Kerala, India",
        timezone: "IST (UTC+5:30)",
        notifyOnInquiry: true,
      },
    })
    .onConflictDoNothing();

  console.log(
    `Seeded ${insertedProjects.length} project(s), ${insertedLog.length} lab entr${insertedLog.length === 1 ? "y" : "ies"}.`,
  );
}

main()
  .catch((err) => {
    console.error(err instanceof DatabaseConfigError ? `
✗ ${err.message}
` : err);
    process.exitCode = 1;
  })
  .finally(() => sql.end());
