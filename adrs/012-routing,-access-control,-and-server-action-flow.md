# ADR-012: Routing, Access Control, and Server Action Flow

- **Status:** Accepted for PoC
- **Date:** 2026-11-23

## Context
The Bridal Shower List PoC needs clear routing boundaries separating public guest access, Google OAuth 2.0 authentication, and authenticated organizer management. It also requires a consistent server-side execution flow across Server Actions, services, and repositories while keeping API routes minimal and returning predictable results to UI components.

## Decision
1. **Route Classification & Projections:**
   - **Public Routes:** Expose shared registry reading (`title`, `description`, `createdAt` from `Gift Registry` plus `user.name` of the owner/organizer) for active, non-expired registries without requiring authentication.
   - **Authentication Routes:** Use standard Google OAuth 2.0 login, callback, and logout flows.
   - **Authenticated Organizer Routes:** Require a valid session and enforce resource ownership checks. Display basic logged-in user info (name and profile photo URL) and the user's registries (`title`, `description`, `createdAt`, `expirationAt`), revealing `slug` only on share action. Registry item views display item details while excluding internal/audit fields (`id`, `registryId`, `userId`, `deletedAt`, `updatedAt`).
2. **Standardized Server Action Result Contract:** All Server Actions validate inputs via Zod (`safeParse`), verify authentication/authorization where required, delegate business logic to services/repositories, and return a uniform envelope (`{ success: boolean, error?: string, data?: ... }`) with user-friendly error messages and no leaked internal errors.
3. **Minimal API Routes:** Avoid custom HTTP API routes unless an external endpoint/webhook/OAuth callback requires one; delegate any exceptional API route to services and document it when applicable.

## Consequences / Trade-offs
- **Pros:**
  - Predictable UI error and data handling across all Server Actions.
  - Explicit field projections prevent leaking internal identifiers or timestamps in public and item views.
  - Keeps server execution centralized and avoids unnecessary HTTP endpoint overhead during the PoC.
- **Cons / Risks:**
  - Requires disciplined ownership verification on every organizer mutation to prevent unauthorized access across users.
  - Returning a uniform error string requires mapping technical/validation failures to clear messages without losing debugging logs server-side.