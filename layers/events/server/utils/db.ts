import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../database/schema";

let db: ReturnType<typeof drizzle<typeof schema>> | undefined;

export function useDb() {
  if (db) return db;

  const { databaseUrl } = useRuntimeConfig();
  if (!databaseUrl) {
    throw createError({
      statusCode: 503,
      statusMessage: "Database is not configured",
    });
  }

  db = drizzle(postgres(databaseUrl, { max: 5 }), { schema });
  return db;
}

export const tables = schema;
