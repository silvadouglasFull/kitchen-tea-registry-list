import { pgTable, text, timestamp, unique, uuid } from "drizzle-orm/pg-core";
import { users } from "./users";

/**
 * Federated OAuth provider accounts table (SPEC-009 / ADR-009).
 * Each row links a provider identity (e.g. Google) to a core user record.
 * The unique constraint on (provider, providerUserId) prevents duplicates.
 */
export const authAccounts = pgTable(
  "auth_accounts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    provider: text("provider").notNull(),
    providerUserId: text("provider_user_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [unique("auth_accounts_provider_user_uniq").on(table.provider, table.providerUserId)],
);

/** An auth account record as retrieved from the database. */
export type AuthAccount = typeof authAccounts.$inferSelect;

/** Data required to insert a new auth account record. */
export type NewAuthAccount = typeof authAccounts.$inferInsert;
