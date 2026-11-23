# Task 006: PoC User Interface & End-to-End Flow

## 1. Objective
Implement the essential Next.js App Router pages, physical form components (`shadcn-zod-form` + React Hook Form + `zodResolver` + `shadcn/ui` + Tailwind CSS), and end-to-end user journeys for the Bridal Shower List PoC so the core workflow can be demonstrated and validated with the client.

## 2. References
- `AGENTS.md`
- `docs/templates/zod-schema-template.md`
- `adrs/001-modular-stack-and-structure-for-the-proof-of-concept.md` (ADR-001)
- `adrs/002-naming-conventions,-eslint-and-schemas-with-zod.md` (ADR-002)
- `adrs/004-google-social-authentication-(oauth-2.0).md` (ADR-004)
- `adrs/008-code-generation-and-crud-automation-strategy.md` (ADR-008)
- `adrs/012-routing,-access-control,-and-server-action-flow.md` (ADR-012)
- `specs/001-project-architecture-and-modular-structure-for-the-poc.md` (SPEC-001)
- `specs/004-google-social-authentication.md` (SPEC-004)
- `specs/008-crud-scaffolding-and-form-generation-automation.md` (SPEC-008)
- `specs/010-user-profile-photo-data-model-and-operations.md` (SPEC-010)
- `specs/011-gift-registry-and-registry-items-data-model-and-contracts.md` (SPEC-011)
- `specs/012-access-rules,-routing,-and-server-action-contract.md` (SPEC-012)
- PoC Spec (`PoC Spec: Kitchen Tea Gift Registry`)

## 3. Architectural Constraints (Mandatory)
- **Public Guest Projection (`SPEC-012`):** Public shared registry routes require no authentication, filter out soft-deleted and expired registries, and display only `title`, `description`, `createdAt` from `Gift Registry`, active items, and `user.name` of the owner/organizer.
- **Protected Organizer Views & Projections (`SPEC-012`):**
  - Require an authenticated session and ownership checks for mutations/private access.
  - Display logged-in organizer basic info (`name` and profile photo `publicUrl`).
  - Display organizer registries showing `title`, `description`, `createdAt`, and `expirationAt`, revealing `slug` only when the share button/action is triggered.
  - Dedicated registry item view displays item details while omitting `id`, `registryId`, `userId`, `deletedAt`, and `updatedAt`.
- **Physical Forms & Uniform Action Consumption (`SPEC-008`, `SPEC-012`):**
  - Use physical `.tsx` form components built with React Hook Form, `zodResolver`, pure Zod schemas, `shadcn/ui`, and Tailwind CSS (no `AutoForm` or runtime form generation).
  - Consume Server Actions expecting `{ success: boolean; error?: string; data?: T }` and surface clear, user-friendly feedback without leaking internal details.
- **PoC Scope Boundaries:** Keep UI focused strictly on login, organizer registry/item/profile management, share link reveal, and guest viewing. Do not add reservations, quantities, cash/PIX gifts, RSVP, or guestbook features.

## 4. Execution Steps
1. **Authentication & Entry Flow:**
   - Create Google OAuth sign-in / sign-out controls and handle authenticated vs. unauthenticated navigation cleanly.
2. **Organizer Dashboard, Profile Photo & Registry Management:**
   - Build the protected organizer dashboard displaying the logged-in user's `name` and profile photo (`publicUrl` or fallback) and allowing profile photo upload/replacement/removal via the `user-profile` Server Actions.
   - Generate/create physical `.tsx` forms (`npx shadcn-zod-form@latest generate`) for creating and editing registries (`title`, `description`, optional `expirationAt`/wedding date) and connect them to `registry` Server Actions.
   - Render the organizer's registries showing `title`, `description`, `createdAt`, and `expirationAt`, and reveal/copy the shareable link/`slug` only when the organizer clicks the share action.
3. **Dedicated Registry Item View & Item Management:**
   - Build the dedicated item screen/flow for managing registry items (add, edit, remove, including optional photo upload/removal) and displaying item information while omitting `id`, `registryId`, `userId`, `deletedAt`, and `updatedAt`.
   - Handle `{ success, error?, data? }` responses cleanly in the UI.
4. **Public Shared Registry View (Guest Flow):**
   - Build the public route for viewing a shared registry by `slug` without requiring login, displaying `title`, `description`, `createdAt`, active items (with clean projection), and organizer `user.name`, plus a clear state for missing, deleted, or expired registries.
5. **End-to-End PoC Verification:**
   - Manually walk through the full client demo flow locally (Google login -> update profile photo -> create registry -> add item with photo -> reveal share link -> open shared link in an unauthenticated session -> view item details).
   - Run `npm run lint` and `npm run build` and confirm zero errors or warnings.

## 5. Acceptance Criteria
- [ ] Organizer can sign in with Google OAuth 2.0, view their `name` and profile photo, and update/remove their profile photo.
- [ ] Organizer can create/manage registries showing `title`, `description`, `createdAt`, and `expirationAt`, with `slug` shown only when the share action is triggered.
- [ ] Dedicated registry item view displays item fields while omitting `id`, `registryId`, `userId`, `deletedAt`, and `updatedAt`, and supports adding/editing/removing items with optional photos.
- [ ] Unauthenticated guest can open a shared registry link and see `title`, `description`, `createdAt`, active items, and organizer `user.name` (while expired or soft-deleted registries are not exposed).
- [ ] Forms are physical `.tsx` components using React Hook Form, `zodResolver`, `shadcn/ui`, and Tailwind CSS, handling `{ success, error?, data? }` responses cleanly.
- [ ] `npm run lint` and `npm run build` pass with zero errors or warnings.