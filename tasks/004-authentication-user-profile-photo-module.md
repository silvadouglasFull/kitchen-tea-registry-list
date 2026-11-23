# Task 004: Authentication & User Profile Photo Module

## 1. Objective
Implement Google OAuth 2.0 social authentication (login, callback, and logout flows) linked to the `users` and `authAccounts` tables, and build the `user-profile` module with strictly restricted operations (create, update, delete, and find `publicUrl` by `userId`) integrated with the storage module.

## 2. References
- `AGENTS.md`
- `docs/templates/zod-schema-template.md`
- `adrs/002-naming-conventions,-eslint-and-schemas-with-zod.md` (ADR-002)
- `adrs/004-google-social-authentication-(oauth-2.0).md` (ADR-004)
- `adrs/005-image-upload-strategy-with-cloudflare-r2.md` (ADR-005)
- `adrs/009-authentication-and-federated-account-tables.md` (ADR-009)
- `adrs/010-user-profile-photo-persistence-and-multi-provider-url-strategy.md` (ADR-010)
- `adrs/012-routing,-access-control,-and-server-action-flow.md` (ADR-012)
- `specs/004-google-social-authentication.md` (SPEC-004)
- `specs/009-authentication-data-model-and-contracts.md` (SPEC-009)
- `specs/010-user-profile-photo-data-model-and-operations.md` (SPEC-010)
- `specs/012-access-rules,-routing,-and-server-action-contract.md` (SPEC-012)

## 3. Architectural Constraints (Mandatory)
- **Google OAuth 2.0 Only (`ADR-004`, `SPEC-004`):** Do not implement email/password registration, password resets, or other OAuth providers in the PoC.
- **Two-Table Identity Persistence (`ADR-009`, `SPEC-009`):** Persist core user identity in `users` and federated provider links (`provider: "google"`, `providerUserId`) in `authAccounts`.
- **Restricted User Profile Surface (`ADR-010`, `SPEC-010`):**
  - Repository and service must expose **only** four operations: `create`, `updateByUserId`, `deleteByUserId`, and `findPublicUrlByUserId`.
  - No bulk listing, pagination, or multi-user search methods.
  - Querying a user's profile photo must return **only** `{ publicUrl: string | null }` (never exposing `id`, `userId`, `storageProvider`, or timestamps).
- **Pure Zod Contracts & Action Envelope (`SPEC-008`, `SPEC-012`):**
  - Use pure Zod schemas (`z.infer`), no `drizzle-zod`.
  - All Server Actions must validate inputs via `.safeParse()`, verify session/ownership, and return `{ success: boolean; error?: string; data?: T }`.
- **Naming Conventions (`ADR-002`):** `kebab-case` filenames, `camelCase` variables/functions/classes/schemas, `PascalCase` inferred types and React components.

## 4. Execution Steps

### Part A: Google OAuth 2.0 Authentication (`SPEC-004`, `SPEC-009`, `SPEC-012`)
1. **Scaffold Authentication Module (`src/modules/authentication/`):**
   - Run `npx plop module` for `authentication` (or structure `domain/`, `application/`, `infrastructure/` per `AGENTS.md`).
   - Create pure Zod schemas following `docs/templates/zod-schema-template.md`:
     - `src/modules/authentication/application/schemas/create-user.schema.ts` (`createUserSchema`, `CreateUserInput`)
     - `src/modules/authentication/domain/schemas/user.schema.ts` (`userSchema`, `User`)
     - `src/modules/authentication/application/schemas/create-auth-account.schema.ts` (`createAuthAccountSchema`, `CreateAuthAccountInput`)
     - `src/modules/authentication/domain/schemas/auth-account.schema.ts` (`authAccountSchema`, `AuthAccount`)
2. **Implement Authentication Repositories & Services:**
   - Implement `user-repository.ts` and `auth-account-repository.ts` using Drizzle ORM (`users` and `authAccounts` tables).
   - Implement `authentication-service.ts` to resolve or create the user + linked Google account on OAuth sign-in, and seed an initial `userProfiles` entry with `storageProvider: "google-login"` if the user has a Google avatar and no existing profile photo record.
3. **Configure OAuth 2.0 Routes & Session Helpers (`SPEC-004`, `SPEC-012`):**
   - Configure Next.js Google OAuth 2.0 login, callback, and logout routes (`AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`).
   - Implement a server-side session helper (`getAuthenticatedUser` / `requireAuthenticatedUser`) so protected Server Actions and routes can reliably resolve the signed-in `userId` and `user.name`.

### Part B: User Profile Photo Module (`SPEC-005`, `SPEC-010`)
4. **Create Zod Schemas (`src/modules/user-profile/`):**
   - Follow Section 5 of `docs/templates/zod-schema-template.md`:
     - `storageProviderEnum` (`"r2" | "s3" | "google-drive" | "google-login"`)
     - `createUserProfileSchema` (`CreateUserProfileInput`)
     - `updateUserProfileSchema` (`UpdateUserProfileInput`)
     - `userProfilePhotoSchema` (`UserProfilePhoto` -> `{ publicUrl: string | null }`)
5. **Implement Restricted Repository & Service:**
   - `src/modules/user-profile/infrastructure/repositories/user-profile-repository.ts`: implement strictly `create`, `updateByUserId`, `deleteByUserId`, and `findPublicUrlByUserId` (filtering `deletedAt IS NULL` and projecting only `publicUrl`).
   - `src/modules/user-profile/application/services/user-profile-service.ts`:
     - Enforce the same four operations only.
     - When uploading a new profile photo, delegate file validation and upload to `src/modules/storage/` (`organizers/{organizerId}/profile/{uuid}.{extension}`) with `storageProvider: "r2"`.
     - When replacing or deleting an existing `r2` profile photo, extract the object key by stripping `R2_PUBLIC_URL` and delete the previous object via the storage module (`SPEC-005`).
6. **Implement Server Actions (`src/modules/user-profile/application/actions/`):**
   - Implement `update-user-profile-photo-action.ts` and `delete-user-profile-photo-action.ts` using `'use server'`, Zod `.safeParse()`, session verification, and standardized `{ success, error?, data? }` responses.

## 5. Acceptance Criteria
- [ ] Google OAuth 2.0 login, callback, and logout flows work end-to-end and persist records in `users` and `authAccounts`.
- [ ] Server-side session helpers accurately identify the logged-in organizer (`id`, `name`, `email`) and protect private routes/actions.
- [ ] `user-profile` repository and service expose strictly four methods (`create`, `updateByUserId`, `deleteByUserId`, `findPublicUrlByUserId`) with no bulk listing methods.
- [ ] Retrieving a user's profile photo returns exclusively `{ publicUrl: string | null }`.
- [ ] Uploading, replacing, or deleting an `r2` profile photo stores the object in Garage/R2 and cleans up the replaced/deleted file without leaving orphaned objects.
- [ ] All Server Actions return `{ success, error?, data? }` with user-friendly error messages, and `npm run lint` passes with zero errors or warnings.