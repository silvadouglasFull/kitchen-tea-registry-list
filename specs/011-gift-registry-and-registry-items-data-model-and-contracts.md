# SPEC-011: Gift Registry and Registry Items Data Model and Contracts

- **Requirement:** RF-07 - Gift Registry and Registry Items Persistence
- **Status:** Specification
- **Date:** 2026-11-23

## 1. Overview
This specification defines the PostgreSQL database tables (via Drizzle ORM) and pure Zod validation contracts for bridal shower gift lists (`registries`) and their associated gift products (`registryItems`) in the PoC[cite: 1, 3, 7, 9].

## 2. Database Entities (`SPEC-007`)
Each table must reside in its own dedicated Drizzle schema file (`src/shared/database/schema/registries.ts` and `src/shared/database/schema/registry-items.ts`)[cite: 9, 10]:

### 2.1. Gift Registry (`registries`)
- `id`: UUID primary key generated on creation.
- `userId`: UUID foreign key referencing `users.id` (list owner/organizer).
- `title`: Required string (3 to 120 characters) representing the bridal shower list title.
- `description`: Nullable text (max 1000 characters) for an optional welcome message to guests.
- `slug`: Required unique URL-safe string used in the shareable guest link.
- `expirationAt`: Nullable timestamp indicating when the list expires (defaults to the wedding date if provided by the organizer).
- `createdAt`: Timestamp recording creation time.
- `updatedAt`: Timestamp recording last update time.
- `deletedAt`: Nullable timestamp for soft deletion.

### 2.2. Registry Item (`registryItems`)
- `id`: UUID primary key generated on creation.
- `registryId`: UUID foreign key referencing `registries.id`.
- `userId`: UUID foreign key referencing `users.id` (owner verification).
- `name`: Required string (2 to 150 characters) representing the product/gift name.
- `imageUrl`: Nullable string storing the full public URL of an optional product photo uploaded to Cloudflare R2.
- `notes`: Nullable text (max 400 characters) for product specifications such as color, size, voltage, or model.
- `shopUrl`: Nullable string storing an optional external store reference URL (`http`/`https`).
- `createdAt`: Timestamp recording creation time.
- `updatedAt`: Timestamp recording last update time.
- `deletedAt`: Nullable timestamp for soft deletion.

## 3. Integrity and Business Rules
- **Ownership Enforcement:** Only the authenticated `userId` who owns a `registry` can update or delete that registry or manage its `registryItems`.
- **Guest Visibility:** Public guest queries by `slug` must only return active registries (`deletedAt IS NULL` and not past `expirationAt`, when set) along with their active items (`deletedAt IS NULL`).
- **URL Safety:** `imageUrl` and `shopUrl` must be validated as valid `http` or `https` URLs when provided.
- **R2 Cleanup:** Deleting or replacing an item's R2-hosted `imageUrl` must trigger removal of the previous object from Cloudflare R2 (`SPEC-005`).

## 4. Zod Contracts and Naming Conventions (`SPEC-002`, `SPEC-006`, `SPEC-008`)
- Use pure Zod schemas (no `drizzle-zod`) separated by responsibility[cite: 1, 2, 3, 4]:
  - **Registry (`src/modules/registry/`):** `createRegistrySchema` (`CreateRegistryInput`), `updateRegistrySchema` (`UpdateRegistryInput`), and `registrySchema` (`Registry`)[cite: 1, 3].
  - **Registry Item (`src/modules/registry-item/` or `src/modules/registry/`):** `createRegistryItemSchema` (`CreateRegistryItemInput`), `updateRegistryItemSchema` (`UpdateRegistryItemInput`), and `registryItemSchema` (`RegistryItem`)[cite: 1, 3].
- Creation and update schemas must exclude internal database fields (`id`, `createdAt`, `updatedAt`, `deletedAt`)[cite: 1].

## 5. Out of Scope for this PoC
- Item reservation/claiming status (`isReserved`, `reservedBy`, `reservedAt`).
- Desired vs. purchased item quantities.
- Cash gifts, PIX keys, RSVP confirmations, and guestbook messages.

## 6. Acceptance Criteria
- [ ] `registries` and `registryItems` are defined in separate Drizzle schema files with native Drizzle insert/select types[cite: 9, 10].
- [ ] `registries.slug` enforces uniqueness for public guest sharing.
- [ ] Pure Zod schemas exist for creation, update, and domain/output contracts with inferred `PascalCase` types[cite: 1, 3, 4].
- [ ] Public guest lookup by `slug` excludes soft-deleted registries/items and expired registries.
- [ ] Item image updates/deletions clean up orphaned files in Cloudflare R2 (`SPEC-005`).