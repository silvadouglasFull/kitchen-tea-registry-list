import { pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { users } from "./users";

/**
 * Allowed origins for a profile photo URL (SPEC-010 / ADR-010).
 * - r2 / s3: uploaded to object storage.
 * - google-login: avatar URL supplied by Google OAuth.
 * - google-drive: direct Drive image link (future provider).
 */
export const storageProviderEnum = pgEnum("storage_provider", [
  "r2",
  "s3",
  "google-drive",
  "google-login",
]);

/**
 * User profile photo metadata table (SPEC-010 / ADR-010).
 * Stores only the metadata and public URL — binary data lives in R2/Garage.
 */
export const userProfiles = pgTable("user_profiles", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  storageProvider: storageProviderEnum("storage_provider").notNull(),
  publicUrl: text("public_url").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

/** A user profile record as retrieved from the database. */
export type UserProfile = typeof userProfiles.$inferSelect;

/** Data required to insert a new user profile record. */
export type NewUserProfile = typeof userProfiles.$inferInsert;
