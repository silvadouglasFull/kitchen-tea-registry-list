import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

/**
 * Primary PostgreSQL connection (SPEC-007 / ADR-007).
 *
 * Uses the DATABASE_URL environment variable — credentials stay server-side only.
 * Repositories receive this instance explicitly rather than importing a global singleton,
 * which keeps the connection decoupled and supports future multi-connection scenarios.
 */
function createPrimaryPool(): Pool {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL environment variable is not set.");
  }
  return new Pool({ connectionString: url });
}

const primaryPool = createPrimaryPool();

/** Drizzle ORM instance backed by the primary PostgreSQL connection pool. */
export const primaryDb = drizzle(primaryPool);

export type PrimaryDb = typeof primaryDb;
