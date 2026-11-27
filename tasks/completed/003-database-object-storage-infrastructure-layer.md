# Task 003 — Database & Object Storage Infrastructure Layer

**Project:** Kitchen Tea Gift Registry (PoC)
**Date completed:** 2026-11-27
**References:** `ADR-003`, `ADR-005`, `ADR-007`, `ADR-009`, `ADR-010`, `ADR-011`, `ADR-013`, `SPEC-003`, `SPEC-005`, `SPEC-007`, `SPEC-009`, `SPEC-010`, `SPEC-011`

---

## Objective

Configure the server-side PostgreSQL persistence layer using Drizzle ORM with one dedicated schema file per table and multi-connection support, generate and apply the initial SQL migration, and implement the S3-compatible object storage module supporting local Garage and production Cloudflare R2.

---

## What was done

### Part A — PostgreSQL & Drizzle ORM

#### Step 1: Primary database connection

Created `src/shared/database/connections/primary.ts`:

- Builds a `pg.Pool` from `DATABASE_URL` (throws at startup if unset).
- Wraps the pool in a Drizzle instance exported as `primaryDb` with its `PrimaryDb` type.
- Repositories receive this instance explicitly — no global singleton coupling.

#### Step 2: Database index

Created `src/shared/database/index.ts` as the single entry-point for all database imports:

- Re-exports `primaryDb` as `db` and `PrimaryDb`.
- Re-exports every table definition and its `$inferSelect` / `$inferInsert` types from each dedicated schema file.

Updated the Task 002 stub `src/shared/database/client.ts` to a backward-compatible re-export of `db` from `./index`, so existing repository imports continue to compile without change.

#### Step 3: Dedicated table schema files

Each table lives in its own file under `src/shared/database/schema/`.

| File | Table | Key details |
| :--- | :--- | :--- |
| `users.ts` | `users` | `id` (uuid PK), `name`, `email` (unique), `createdAt` |
| `auth-accounts.ts` | `auth_accounts` | `id`, `userId` → `users`, `provider`, `providerUserId`; composite unique on `(provider, providerUserId)` |
| `user-profiles.ts` | `user_profiles` | `id`, `userId` → `users` (unique FK), `storageProvider` enum, `publicUrl`, `createdAt`, `updatedAt`, `deletedAt` |
| `registries.ts` | `registries` | `id`, `userId` → `users`, `title`, `description`, `slug` (unique), `expirationAt`, `createdAt`, `updatedAt`, `deletedAt` |
| `registry-items.ts` | `registry_items` | `id`, `registryId` → `registries`, `userId` → `users`, `name`, `imageUrl` (nullable), `notes`, `shopUrl`, `createdAt`, `updatedAt`, `deletedAt` |

Every file exports native `$inferSelect` and `$inferInsert` types. The `storage_provider` Postgres enum is defined in `user-profiles.ts` and exported from the database index.

All foreign keys use `ON DELETE CASCADE`.

#### Step 4: Drizzle Kit configuration

Created `drizzle.config.ts` at the project root:

- `dialect: "postgresql"`, `dbCredentials: { url: process.env.DATABASE_URL }`.
- `schema: "./src/shared/database/schema"` — Drizzle Kit discovers all five table files automatically.
- `out: "./drizzle"` — migration artefacts written here.

#### Step 5: Migration generation and application

Generated the initial SQL migration:

```bash
npx drizzle-kit generate --name=init-poc-schema
# Output: drizzle/0000_init-poc-schema.sql
```

The generated SQL creates the `storage_provider` enum, all five tables with constraints and foreign keys, then applied it:

```bash
npx drizzle-kit migrate
```

Verified in PostgreSQL — all five tables and the enum are present in the `public` schema.

---

### Part B — Object Storage Module

#### Step 6: Module directory structure

```
src/modules/storage/
  storage.types.ts
  application/
    storage-service.ts
  infrastructure/
    cloudflare-r2/
      r2-client.ts
      r2-storage-provider.ts
```

#### Step 7: `storage.types.ts` — shared types and object-key strategy

Defines the public interface shared across all storage layers:

- `ALLOWED_MIME_TYPES` — `image/jpeg`, `image/png`, `image/webp`, `image/gif`.
- `MAX_FILE_SIZE_BYTES` — 5 MB.
- `MAGIC_BYTES` — per-MIME magic-byte signatures for content verification.
- `UploadResult` — `{ objectKey: string; publicUrl: string }`.
- `RegistryItemUploadParams` / `OrganizerProfileUploadParams` — typed input shapes.
- `buildRegistryItemKey(registryId, itemId, uuid, ext)` → `registries/{registryId}/items/{itemId}/{uuid}.{ext}`.
- `buildOrganizerProfileKey(organizerId, uuid, ext)` → `organizers/{organizerId}/profile/{uuid}.{ext}`.

Object keys always use a UUID segment — original filenames are never used.

#### Step 8: `r2-client.ts` — S3Client factory

Reads five environment variables at startup:

| Variable | Local (Garage) | Production (R2) |
| :--- | :--- | :--- |
| `STORAGE_ENDPOINT` | `http://localhost:3900` | R2 account endpoint |
| `STORAGE_REGION` | `"garage"` | `"auto"` |
| `STORAGE_FORCE_PATH_STYLE` | `"true"` | `"false"` / omit |
| `R2_ACCESS_KEY_ID` | Garage key | R2 key |
| `R2_SECRET_ACCESS_KEY` | Garage secret | R2 secret |

Throws descriptively if any required variable is absent. Exports a singleton `r2Client`.

#### Step 9: `r2-storage-provider.ts` — upload, delete, validation

Internal `validateFile(buffer, mimeType)`:

1. Rejects empty buffers.
2. Rejects files exceeding `MAX_FILE_SIZE_BYTES`.
3. Rejects MIME types not in `ALLOWED_MIME_TYPES`.
4. Rejects files whose magic bytes do not match the declared MIME type.

`r2StorageProvider` exposes four methods:

- `uploadRegistryItemPhoto(params)` — validates, generates key via `buildRegistryItemKey`, calls `PutObjectCommand`.
- `uploadOrganizerProfilePhoto(params)` — validates, generates key via `buildOrganizerProfileKey`, calls `PutObjectCommand`.
- `deleteByKey(objectKey)` — calls `DeleteObjectCommand` directly.
- `deleteByPublicUrl(publicUrl)` — strips `R2_PUBLIC_URL` prefix to recover the key, then calls `deleteByKey`.

Both upload methods return `UploadResult` with the object key and the full `${R2_PUBLIC_URL}/${objectKey}` public URL.

#### Step 10: `storage-service.ts` — application facade

`storageService` in `src/modules/storage/application/storage-service.ts` is the **only** storage entry-point that domain modules (`user-profile`, `registry-item`) import. It delegates to `r2StorageProvider` and keeps `@aws-sdk/client-s3` invisible to callers:

- `uploadRegistryItemPhoto(params)` → `UploadResult`
- `uploadOrganizerProfilePhoto(params)` → `UploadResult`
- `deleteByKey(objectKey)` → `void`
- `deleteByPublicUrl(publicUrl)` → `void`

---

## Key files created or modified

```
src/shared/database/connections/primary.ts      Drizzle + pg.Pool; exports primaryDb / PrimaryDb
src/shared/database/index.ts                    Central re-export of db, all tables, all types
src/shared/database/client.ts                   Backward-compat stub → re-exports db from index
src/shared/database/schema/users.ts             users table + User / NewUser types
src/shared/database/schema/auth-accounts.ts     auth_accounts table + AuthAccount / NewAuthAccount types
src/shared/database/schema/user-profiles.ts     user_profiles table + storageProviderEnum + types
src/shared/database/schema/registries.ts        registries table + Registry / NewRegistry types
src/shared/database/schema/registry-items.ts    registry_items table + RegistryItem / NewRegistryItem types
drizzle.config.ts                               Drizzle Kit configuration
drizzle/0000_init-poc-schema.sql                Initial SQL migration (enum + 5 tables)
src/modules/storage/storage.types.ts            Shared types, key builders, constants
src/modules/storage/infrastructure/cloudflare-r2/r2-client.ts        S3Client factory
src/modules/storage/infrastructure/cloudflare-r2/r2-storage-provider.ts  Upload/delete + validation
src/modules/storage/application/storage-service.ts                   Application facade
```

---

## Acceptance criteria

| Criterion | Status |
| :--- | :--- |
| Each of the 5 tables defined in its own file under `src/shared/database/schema/` with `$inferSelect` / `$inferInsert` types | ✅ |
| Database connection setup supports multiple independent connections; repositories receive `db` explicitly | ✅ |
| `drizzle-kit generate` produces SQL under `drizzle/`; `drizzle-kit migrate` applies cleanly to local PostgreSQL | ✅ |
| Storage module validates file format, size, and magic bytes before upload | ✅ |
| Unique resource-prefixed object keys generated for every upload | ✅ |
| Upload and delete operations work against local Garage via `@aws-sdk/client-s3` | ✅ |
| Full public URL returned from every upload | ✅ |
| `storageService` facade isolates domain modules from `@aws-sdk/client-s3` | ✅ |
| No database or S3/R2 credentials exposed to client-side code | ✅ |
| `npm run lint` passes with zero errors or warnings | ✅ |
