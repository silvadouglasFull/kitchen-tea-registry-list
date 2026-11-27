import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { registries } from "./registries";
import { users } from "./users";

/**
 * Individual gift items belonging to a registry (SPEC-011 / ADR-011).
 * imageUrl holds the full Cloudflare R2 / Garage public URL when a photo
 * has been uploaded. It is nullable because the photo is optional.
 */
export const registryItems = pgTable("registry_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  registryId: uuid("registry_id")
    .notNull()
    .references(() => registries.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  imageUrl: text("image_url"),
  notes: text("notes"),
  shopUrl: text("shop_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

/** A registry item record as retrieved from the database. */
export type RegistryItem = typeof registryItems.$inferSelect;

/** Data required to insert a new registry item record. */
export type NewRegistryItem = typeof registryItems.$inferInsert;
