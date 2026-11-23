# SPEC-010: User Profile Photo Data Model and Operations

- **Requirement:** RF-06 - User Profile Photo Management
- **Status:** Specification
- **Date:** 2026-11-23

## 1. Overview
This specification defines the database schema, Zod contracts, and restricted repository/service operations for managing an organizer's profile photo in the Bridal Shower List PoC[cite: 1, 2].

## 2. Database Entity (`userProfiles`)
Persist user profile photo metadata in PostgreSQL using Drizzle ORM (`SPEC-007`)[cite: 1, 5]:
- `id`: UUID primary key generated on creation.
- `userId`: UUID foreign key referencing `users.id` (unique per active user profile).
- `storageProvider`: Enum restricting allowed origins to:
  - `r2`
  - `s3`
  - `google-drive`
  - `google-login`
- `publicUrl`: Required string containing the complete, directly renderable image URL suitable for an HTML `<img>` `src` attribute[cite: 2].
- `createdAt`: Timestamp recording when the record was created.
- `updatedAt`: Timestamp recording the last update.
- `deletedAt`: Nullable timestamp supporting soft deletion.

## 3. URL Formatting and Provider Rules
- `publicUrl` must be a valid `http`/`https` URL pointing directly to an image resource renderable by browsers in `<img>` tags[cite: 12].
- For `r2`, `publicUrl` is composed from `R2_PUBLIC_URL` and the unique object key defined in `SPEC-005` (`organizers/{organizerId}/profile/{uuid}.{extension}`)[cite: 2].
- For `google-login`, `publicUrl` stores the avatar URL provided by Google OAuth.
- For `s3` and `google-drive` (future providers), `publicUrl` must resolve to a direct image endpoint rather than an HTML viewer wrapper[cite: 12].

## 4. Restricted Repository and Service Operations
Both the infrastructure repository (`user-profile-repository.ts`) and application service (`user-profile-service.ts`) must expose **only** the following four operations[cite: 3, 5]:
1. **Create:** Persist a new profile photo record for a `userId` (`create`).
2. **Update:** Update `storageProvider`, `publicUrl`, and `updatedAt` for an existing `userId` (`updateByUserId`). When replacing an `r2` image, trigger cleanup of the previous R2 object per `SPEC-005`[cite: 2].
3. **Delete:** Mark the profile photo as deleted (`deletedAt`) or remove it for a `userId` (`deleteByUserId`), triggering R2 object removal when `storageProvider` is `r2`[cite: 2].
4. **Find by User ID:** Retrieve only the `publicUrl` of the active (non-deleted) profile photo for a given `userId` (`findPublicUrlByUserId`).

No bulk listing, pagination, or multi-user search methods shall be implemented in this module.

## 5. Return Projection & Zod Contracts
- **Retrieval Output:** Querying a user's profile photo must return only the `publicUrl` (or `null` if no active profile photo exists), never exposing `id`, `userId`, `storageProvider`, or timestamps[cite: 3, 9].
- **Naming Conventions (`SPEC-008`):**
  - Domain output schema: `userProfilePhotoSchema` -> inferred type `UserProfilePhoto` (`{ publicUrl: string | null }`).
  - Application input schemas: `createUserProfileSchema` (`CreateUserProfileInput`) and `updateUserProfileSchema` (`UpdateUserProfileInput`)[cite: 3, 9].

## 6. Acceptance Criteria
- [ ] `userProfiles` table is defined in a dedicated Drizzle schema file with the `storageProvider` enum (`r2`, `s3`, `google-drive`, `google-login`) and timestamps (`createdAt`, `updatedAt`, `deletedAt`)[cite: 5].
- [ ] `publicUrl` stores a complete URL renderable directly inside an HTML `<img>` element[cite: 2, 12].
- [ ] Repository and service expose strictly create, update, delete, and single-user retrieval by `userId`[cite: 3, 5].
- [ ] Retrieval by `userId` returns exclusively the `publicUrl` (or `null` when absent)[cite: 3, 9].
- [ ] Replacing or deleting an `r2`-backed profile photo cleans up the corresponding R2 object (`SPEC-005`)[cite: 2].