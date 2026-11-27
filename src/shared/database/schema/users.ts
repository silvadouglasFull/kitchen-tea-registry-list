import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

/**
 * Core application user identity table (SPEC-009 / ADR-009).
 * One record per user regardless of how many OAuth providers they link.
 */
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/** A user record as retrieved from the database. */
export type User = typeof users.$inferSelect;

/** Data required to insert a new user record. */
export type NewUser = typeof users.$inferInsert;
