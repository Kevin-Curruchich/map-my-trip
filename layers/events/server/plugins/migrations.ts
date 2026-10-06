import { resolve } from "node:path";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

// Arbitrary constant so concurrent instances don't migrate at the same time.
const MIGRATION_LOCK_ID = 727274;

export default defineNitroPlugin(async () => {
  const { databaseUrl } = useRuntimeConfig();
  if (!databaseUrl) {
    console.warn("NUXT_DATABASE_URL is not set; skipping database migrations.");
    return;
  }

  // In production the Dockerfile copies the migrations to MIGRATIONS_DIR.
  const migrationsFolder =
    process.env.MIGRATIONS_DIR ??
    resolve("layers/events/server/database/migrations");

  // A single connection keeps the advisory lock and the migration together.
  const client = postgres(databaseUrl, { max: 1, onnotice: () => {} });
  try {
    await client`select pg_advisory_lock(${MIGRATION_LOCK_ID})`;
    await migrate(drizzle(client), { migrationsFolder });
  } catch (error) {
    console.error("Database migration failed:", error);
    throw error;
  } finally {
    await client`select pg_advisory_unlock(${MIGRATION_LOCK_ID})`.catch(
      () => {}
    );
    await client.end();
  }
});
