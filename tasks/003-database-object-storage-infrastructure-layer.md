# Task 003: Database & Object Storage Infrastructure Layer

## 1. Objective
Configure the server-side PostgreSQL persistence layer using Drizzle ORM and Drizzle Kit migrations (with one dedicated schema file per table and multi-connection support), and implement the S3-compatible object storage module supporting Garage locally and Cloudflare R2 in production.

## 2. References
- `AGENTS.md`
- `adrs/003-stack-and-postgresql-database-selection.md` (ADR-003)
- `adrs/005-image-upload-strategy-with-cloudflare-r2.md` (ADR-005)
- `adrs/007-drizzle-orm-for-database-access-and-migrations.md` (ADR-007)
- `adrs/009-authentication-and-federated-account-tables.md` (ADR-009)
- `adrs/010-user-profile-photo-persistence-and-multi-provider-url-strategy.md` (ADR-010)
- `adrs/011-bridal-shower-registry-and-registry-items-data-model.md` (ADR-011)
- `adrs/013-local-development-infrastructure-with-docker-and-garage.md` (ADR-013)
- `specs/003-application-stack-and-postgresql-database.md` (SPEC-003)
- `specs/005-image-upload-and-storage-with-cloudflare-r2.md` (SPEC-005)
- `specs/007-database-access-and-migration-management-with-drizzle-orm.md` (SPEC-007)
- `specs/009-authentication-data-model-and-contracts.md` (SPEC-009)
- `specs/010-user-profile-photo-data-model-and-operations.md` (SPEC-010)
- `specs/011-gift-registry-and-registry-items-data-model-and-contracts.md` (SPEC-011)

## 3. Architectural Constraints (Mandatory)
- **Dedicated File per Table (`SPEC-007`):** Each database table must live in its own dedicated schema file under `src/shared/database/schema/`, exporting only its table definition and native Drizzle `$inferSelect` / `$inferInsert` types.
- **No `drizzle-zod`:** Never use `drizzle-zod` to derive application schemas from database tables (`SPEC-008`).
- **Multiple Database Connections (`SPEC-007`):** Structure `src/shared/database/connections/` to support independent named database connections so repositories receive their database instance explicitly rather than coupling to a single global connection.
- **Server-Side Isolation:** Keep all database credentials, S3/Garage/R2 credentials, and storage operations strictly on the server side.
- **Storage Provider Compatibility:** Use `@aws-sdk/client-s3` configured via environment variables (`STORAGE_ENDPOINT`, `STORAGE_REGION`, `STORAGE_FORCE_PATH_STYLE`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_PUBLIC_URL`) so local Garage and production Cloudflare R2 work seamlessly.

## 4. Execution Steps

### Part A: PostgreSQL & Drizzle ORM (`SPEC-007`, `SPEC-009`, `SPEC-010`, `SPEC-011`)
1. **Configure Database Connections (`src/shared/database/connections/`):**
   - Create `src/shared/database/connections/primary.ts` (and `src/shared/database/index.ts`) exporting the configured primary Drizzle PostgreSQL instance using `DATABASE_URL` and supporting additional independent connection configurations.
2. **Create Dedicated Table Schema Files (`src/shared/database/schema/`):**
   - `src/shared/database/schema/users.ts`: `users` table (`id`, `name`, `email`, `createdAt`) + inferred `User` / `NewUser` types (`SPEC-009`).
   - `src/shared/database/schema/auth-accounts.ts`: `authAccounts` table (`id`, `userId`, `provider`, `providerUserId`, `createdAt`) with unique constraint on `(provider, providerUserId)` (`SPEC-009`).
   - `src/shared/database/schema/user-profiles.ts`: `userProfiles` table (`id`, `userId`, `storageProvider` enum `['r2', 's3', 'google-drive', 'google-login']`, `publicUrl`, `createdAt`, `updatedAt`, `deletedAt`) (`SPEC-010`).
   - `src/shared/database/schema/registries.ts`: `registries` table (`id`, `userId`, `title`, `description`, `slug` unique, `expirationAt`, `createdAt`, `updatedAt`, `deletedAt`) (`SPEC-011`).
   - `src/shared/database/schema/registry-items.ts`: `registryItems` table (`id`, `registryId`, `userId`, `name`, `imageUrl`, `notes`, `shopUrl`, `createdAt`, `updatedAt`, `deletedAt`) (`SPEC-011`).
3. **Configure Drizzle Kit & Generate/Apply Migrations:**
   - Create `drizzle.config.ts` (and support `--config` for independent database configurations per `SPEC-007`) pointing to `./src/shared/database/schema` and output directory `./drizzle`.
   - Generate initial SQL migrations: `npx drizzle-kit generate --name=init-poc-schema`.
   - Review generated SQL files and apply migrations to local PostgreSQL: `npx drizzle-kit migrate`.

### Part B: Object Storage Module (`SPEC-005`)
4. **Scaffold & Implement Storage Module (`src/modules/storage/`):**
   - Create `src/modules/storage/storage.types.ts` defining storage upload/delete interfaces and object key strategies:
     - Registry item photo: `registries/{registryId}/items/{itemId}/{uuid}.{extension}`
     - Organizer profile photo: `organizers/{organizerId}/profile/{uuid}.{extension}`
   - Implement `src/modules/storage/infrastructure/cloudflare-r2/r2-client.ts` using `@aws-sdk/client-s3` configured for local Garage (`forcePathStyle: true`) and Cloudflare R2.
   - Implement `src/modules/storage/infrastructure/cloudflare-r2/r2-storage-provider.ts` supporting:
     - File validation (allowed MIME types, max file size, magic bytes/content verification).
     - Upload with unique object key generation and full `R2_PUBLIC_URL` resolution.
     - Object deletion by key or by stripping `R2_PUBLIC_URL` prefix.
   - Expose clean application service methods in `src/modules/storage/application/` so domain modules (`user-profile`, `registry-item`) never depend directly on `@aws-sdk/client-s3`.

## 5. Acceptance Criteria
- [ ] Each of the 5 tables (`users`, `authAccounts`, `userProfiles`, `registries`, `registryItems`) is defined in its own dedicated file under `src/shared/database/schema/` with native `$inferSelect` and `$inferInsert` types.
- [ ] Database connection setup supports multiple independent connections without coupling repositories to a single global client.
- [ ] Drizzle Kit generates SQL migrations under `drizzle/` and `npx drizzle-kit migrate` applies them cleanly to local PostgreSQL.
- [ ] `src/modules/storage/` validates file format, size, and content before uploading, generates unique resource-prefixed keys, uploads/deletes objects against local Garage via `@aws-sdk/client-s3`, and returns full public URLs.
- [ ] No database or S3/R2 credentials are exposed to client-side code, and `npm run lint` passes with zero errors or warnings.