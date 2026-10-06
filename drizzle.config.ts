import { defineConfig } from "drizzle-kit";

// Only used to generate migrations (pnpm db:generate); they run on server start.
export default defineConfig({
  dialect: "postgresql",
  schema: "./layers/events/server/database/schema.ts",
  out: "./layers/events/server/database/migrations",
});
