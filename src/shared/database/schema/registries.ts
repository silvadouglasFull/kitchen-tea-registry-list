import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { users } from "./users";

/**
 * Bridal shower gift list table (SPEC-011 / ADR-011).
 * Each registry belongs to one organizer (userId) and is shared publicly
 * via its unique slug — the internal id is never placed in the share URL.
 */
export const registries = pgTable("registries", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  slug: text("slug").notNull().unique(),
  expirationAt: timestamp("expiration_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

/** A registry record as retrieved from the database. */
export type Registry = typeof registries.$inferSelect;

/** Data required to insert a new registry record. */
export type NewRegistry = typeof registries.$inferInsert;
