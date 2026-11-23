## ADR-011: Bridal Shower Registry and Registry Items Data Model

```markdown
# ADR-011: Bridal Shower Registry and Registry Items Data Model

- **Status:** Accepted for PoC
- **Date:** 2026-11-23

## Context
The core domain of the PoC consists of bridal shower gift lists created by authenticated organizers (`users`) and shared via a public link with guests, along with the individual gift items belonging to each list[cite: 7]. These entities must be persisted in PostgreSQL using Drizzle ORM with dedicated schema files (`SPEC-007`) and validated through pure Zod application contracts (`SPEC-002`, `SPEC-006`, `SPEC-008`)[cite: 1, 3, 4, 9].

## Decision
1. **Two Core Domain Tables (`registries` and `registryItems`):**
   - `registries`: Stores each bridal shower list owned by an organizer (`id`, `userId`, `title`, `description`, `slug`, `expirationAt`, `createdAt`, `updatedAt`, `deletedAt`).
   - `registryItems`: Stores each product/gift belonging to a list (`id`, `registryId`, `userId`, `name`, `imageUrl`, `notes`, `shopUrl`, `createdAt`, `updatedAt`, `deletedAt`).
2. **Public Shareable Slug:** Use a unique URL-safe `slug` on `registries` for public guest access rather than exposing internal primary keys directly in share links.
3. **Soft Deletion & Expiration Support:** Include `deletedAt` on both tables and `expirationAt` on `registries` (defaulting to the wedding/event date when provided by the organizer) so inactive or expired lists can be filtered cleanly in guest views.
4. **Optional Media & Store Links on Items:** Keep `imageUrl` (Cloudflare R2 public URL), `notes`, and `shopUrl` nullable/optional on `registryItems` so organizers can add items quickly even without uploading a photo or external store link.

## Consequences / Trade-offs
- **Pros:**
  - Clean relational hierarchy (`users` -> `registries` -> `registryItems`) with explicit ownership (`userId`) for authorization checks.
  - Supports public guest sharing via `slug` without requiring guest authentication in the PoC.
  - Soft-delete timestamps (`deletedAt`) prevent accidental data loss during PoC testing and edits.
- **Cons / Risks:**
  - `slug` generation must handle collisions (e.g., appending a short unique suffix) to satisfy uniqueness constraints.
  - Replacing or deleting an item with an `imageUrl` stored in R2 requires coordinating storage cleanup per `SPEC-005`.