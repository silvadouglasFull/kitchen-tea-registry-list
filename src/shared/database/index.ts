/**
 * Central database entry-point (SPEC-007).
 *
 * Repositories import { db } from "@/shared/database" to access the primary
 * Drizzle instance. Additional named connections can be exported here as the
 * application grows (e.g. analyticsDb, readReplicaDb).
 */
export { primaryDb as db } from "./connections/primary";
export type { PrimaryDb } from "./connections/primary";

// Table schema re-exports — available to repositories and services.
export { users } from "./schema/users";
export type { User, NewUser } from "./schema/users";

export { authAccounts } from "./schema/auth-accounts";
export type { AuthAccount, NewAuthAccount } from "./schema/auth-accounts";

export { userProfiles, storageProviderEnum } from "./schema/user-profiles";
export type { UserProfile, NewUserProfile } from "./schema/user-profiles";

export { registries } from "./schema/registries";
export type { Registry, NewRegistry } from "./schema/registries";

export { registryItems } from "./schema/registry-items";
export type { RegistryItem, NewRegistryItem } from "./schema/registry-items";
