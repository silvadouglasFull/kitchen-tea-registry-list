# SPEC-012: Access Rules, Routing, and Server Action Contract

- **Requirement:** RF-08 - Routing, Access Boundaries, and Server Action Standardization
- **Status:** Specification
- **Date:** 2026-11-23

## 1. Overview
This specification defines the public vs. authenticated route behavior, data projections, Server Action response format, API route boundaries, and security/PoC limits for the Bridal Shower List application.

## 2. Routes and Access Rules
### 2.1. Public Routes (Guest Access)
- Accessible without authentication for active, non-deleted, non-expired registries.
- Projects only:
  - Registry: `title`, `description`, `createdAt`
  - Organizer: `user.name`

### 2.2. Authentication Routes
- Standard Google OAuth 2.0 flow covering login, callback, and logout.

### 2.3. Protected Organizer Routes
- Require an authenticated session and enforce ownership (`resource.userId === session.userId`) on read/mutation operations.
- **Dashboard / Lists:** Displays logged-in user basic info (`name` and profile photo URL) and the organizer's registries with `title`, `description`, `createdAt`, and `expirationAt`. The `slug` is revealed only when the user triggers the share action.
- **Registry Item Screen:** Displays registry item information while omitting `id`, `registryId`, `userId`, `deletedAt`, and `updatedAt`.

## 3. Server Action Flow and Return Shape
- Every Server Action (`'use server'`) must:
  1. Validate incoming payload/arguments using the corresponding Zod schema (`.safeParse()`).
  2. Enforce session and ownership checks for protected operations.
  3. Delegate domain logic to services and persistence to repositories/storage.
  4. Return an object matching:
     `{ success: boolean; error?: string; data?: T }`
     where `error` (when present) contains a clear, user-friendly message without exposing internal stack traces or database details.

## 4. API Routes & Security / PoC Boundaries
- Keep custom API routes to a minimum; prefer Server Actions and server-side execution.
- Never expose database credentials, OAuth secrets, or R2 keys to client components.
- Keep repositories isolated to server-side persistence without business logic, and keep features strictly within PoC scope.

## 5. Acceptance Criteria
- [ ] Public registry view shows `title`, `description`, `createdAt`, and `user.name` without requiring login.
- [ ] Google OAuth login, callback, and logout routes work as expected.
- [ ] Organizer view requires authentication and ownership verification, shows user name/photo and list fields (`title`, `description`, `createdAt`, `expirationAt`), reveals `slug` only on share action, and hides `id`, `registryId`, `userId`, `deletedAt`, and `updatedAt` on the item view.
- [ ] All Server Actions return `{ success, error?, data? }` with friendly error messages.
- [ ] No extra API routes or out-of-scope PoC features are introduced.