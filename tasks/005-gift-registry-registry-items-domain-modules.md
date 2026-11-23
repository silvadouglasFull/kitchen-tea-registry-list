# Task 005: Gift Registry & Registry Items Domain Modules

## 1. Objective
Implement the core domain modules for Bridal Shower Gift Registries (`registries`) and Registry Items (`registryItems`), including pure Zod schemas, Drizzle repositories, business services, optional product image upload/replacement/cleanup via the storage module, ownership enforcement, and Server Actions returning the standardized `{ success, error?, data? }` envelope.

## 2. References
- `AGENTS.md`
- `docs/templates/zod-schema-template.md`
- `adrs/001-modular-stack-and-structure-for-the-proof-of-concept.md` (ADR-001)
- `adrs/002-naming-conventions,-eslint-and-schemas-with-zod.md` (ADR-002)
- `adrs/005-image-upload-strategy-with-cloudflare-r2.md` (ADR-005)
- `adrs/006-validation-strategy-zod-schemas-vs-decorators.md` (ADR-006)
- `adrs/007-drizzle-orm-for-database-access-and-migrations.md` (ADR-007)
- `adrs/008-code-generation-and-crud-automation-strategy.md` (ADR-008)
- `adrs/011-bridal-shower-registry-and-registry-items-data-model.md` (ADR-011)
- `adrs/012-routing,-access-control,-and-server-action-flow.md` (ADR-012)
- `specs/001-project-architecture-and-modular-structure-for-the-poc.md` (SPEC-001)
- `specs/005-image-upload-and-storage-with-cloudflare-r2.md` (SPEC-005)
- `specs/011-gift-registry-and-registry-items-data-model-and-contracts.md` (SPEC-011)
- `specs/012-access-rules,-routing,-and-server-action-contract.md` (SPEC-012)

## 3. Architectural Constraints (Mandatory)
- **Strict Ownership & Soft Deletion (`SPEC-011`, `SPEC-012`):**
  - Only the authenticated organizer who owns a `registry` (`registry.userId === session.userId`) may update, delete, or manage items in that registry.
  - Use `deletedAt` soft deletion on `registries` and `registryItems` rather than hard-deleting business history records.
- **Public Guest Projection (`SPEC-011`, `SPEC-012`):**
  - Public lookups by `slug` must filter out soft-deleted registries/items (`deletedAt IS NULL`) and expired registries (when `expirationAt` is set and in the past).
  - Public guest view exposes only `title`, `description`, `createdAt` from `Gift Registry`, active items, and `user.name` of the organizer.
- **Organizer & Item View Projections (`SPEC-012`):**
  - Organizer list views project `title`, `description`, `createdAt`, and `expirationAt` (revealing `slug` only when explicitly requested/shared).
  - Item views omit `id`, `registryId`, `userId`, `deletedAt`, and `updatedAt`.
- **Storage Cleanup on Item Image Change/Removal (`SPEC-005`, `SPEC-011`):**
  - Uploading or replacing an item image uses object key strategy `registries/{registryId}/items/{itemId}/{uuid}.{extension}` and returns the public URL.
  - Replacing or deleting an existing R2/Garage item image must clean up the previous object in storage; if DB persistence fails after a new upload, attempt compensating deletion of the newly uploaded object.
- **Pure Zod & Uniform Action Response (`SPEC-008`, `SPEC-012`):**
  - Never use `drizzle-zod`. Infer TypeScript types with `z.infer<typeof schema>`.
  - Every Server Action (`'use server'`) must validate inputs via `.safeParse()`, check session/ownership where required, delegate to services/repositories, and return `{ success: boolean; error?: string; data?: T }` without leaking internal errors.
- **PoC Scope Boundaries:** Do not implement item reservation/claiming, desired/purchased quantities, cash/PIX gifts, RSVP, or guestbook messages.

## 4. Execution Steps

### Part A: Gift Registry Module (`src/modules/registry/`)
1. **Scaffold & Define Pure Zod Schemas:**
   - Generate module structure via `npx plop module` (`registry`).
   - Create `createRegistrySchema` (`CreateRegistryInput`), `updateRegistrySchema` (`UpdateRegistryInput`), and `registrySchema` (`Registry`) following `docs/templates/zod-schema-template.md`, excluding internal fields (`id`, `createdAt`, `updatedAt`, `deletedAt`) from creation/update inputs and validating optional URLs (`http`/`https`).
2. **Implement Registry Repository & Service:**
   - Implement `registry-repository.ts` using Drizzle ORM (`registries` joined with `users` where needed) to create, update, soft-delete, list by `userId`, and fetch active/non-expired public registry data by `slug`.
   - Implement `registry-service.ts` to handle unique URL-safe `slug` generation (handling collisions), default `expirationAt` when a wedding/event date is provided, ownership checks, and controlled public vs. organizer projections.
3. **Implement Registry Server Actions:**
   - Implement `'use server'` actions for creating, updating, soft-deleting, and fetching organizer/public registries, validating inputs with `.safeParse()` and returning `{ success, error?, data? }`.

### Part B: Registry Items Module (`src/modules/registry-item/`)
4. **Scaffold & Define Pure Zod Schemas:**
   - Generate module structure via `npx plop module` (`registry-item`).
   - Create `createRegistryItemSchema` (`CreateRegistryItemInput`), `updateRegistryItemSchema` (`UpdateRegistryItemInput`), and `registryItemSchema` (`RegistryItem`), validating `name` (2–150 chars), optional `notes` (max 400 chars), optional `shopUrl` (`http`/`https`), and optional `imageUrl` (`http`/`https`).
5. **Implement Registry Item Repository & Service with Storage Integration:**
   - Implement `registry-item-repository.ts` using Drizzle ORM (`registryItems`) for creating, updating, soft-deleting, and listing active items (`deletedAt IS NULL`) with item-view projections omitting `id`, `registryId`, `userId`, `deletedAt`, and `updatedAt`.
   - Implement `registry-item-service.ts` to verify registry ownership, coordinate image upload/replacement/deletion through `src/modules/storage/`, remove orphaned objects on DB failure, and soft-delete items while cleaning up associated R2/Garage images.
6. **Implement Registry Item Server Actions:**
   - Implement `'use server'` actions for adding, updating, and removing registry items (including optional photo upload/removal), validating with `.safeParse()`, enforcing session and ownership, and returning `{ success, error?, data? }`.

## 5. Acceptance Criteria
- [ ] `registry` and `registry-item` modules follow the modular layout (`domain/`, `application/`, `infrastructure/`) and `ADR-002` naming conventions (`kebab-case` files, `camelCase` variables/functions/classes/schemas, `PascalCase` inferred types).
- [ ] Pure Zod schemas (`z.infer`) are used without `drizzle-zod`, excluding internal DB fields on creation/update inputs.
- [ ] Unique `slug` generation works on registry creation, and public queries by `slug` exclude soft-deleted and expired registries while projecting `title`, `description`, `createdAt`, active items, and organizer `user.name`.
- [ ] Authenticated organizers can create, edit, and soft-delete their own registries and items, while unauthorized cross-user access is rejected.
- [ ] Item image upload, replacement, and deletion work with Garage/Cloudflare R2 via `src/modules/storage/` and clean up replaced, deleted, or failed-persistence objects.
- [ ] All Server Actions validate via `.safeParse()`, return `{ success, error?, data? }` with friendly error messages, and `npm run lint` passes with zero errors or warnings.