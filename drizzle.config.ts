import { defineConfig } from "drizzle-kit";

/**
 * Drizzle Kit configuration — primary PostgreSQL database (SPEC-007 / ADR-007).
 *
 * Usage:
 *   npx drizzle-kit generate            — generate SQL migration files
 *   npx drizzle-kit migrate             — apply pending migrations
 *   npx drizzle-kit studio              — open Drizzle Studio (local only)
 *
 * To add an independent second database, create drizzle-secondary.config.ts
 * and run Drizzle Kit with --config=drizzle-secondary.config.ts
 */
export default defineConfig({
  dialect: "postgresql",
  schema: "./src/shared/database/schema",
  out: "./drizzle",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "",
  },
});
