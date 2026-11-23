# SPEC-009: Authentication Data Model and Contracts

## 1. Overview
This specification defines the relational data model and Zod validation contracts for user authentication and federated login accounts in the Bridal Shower List PoC.

## 2. Entities and Fields
### 2.1. Core User (`users`)
- `id`: unique identifier (UUID) generated on creation.
- `name`: user display name (required string, max length 255).
- `email`: user email address (required valid email string, max length 255).
- `createdAt`: creation timestamp (`Date` or ISO datetime string depending on boundary).

### 2.2. Federated Account (`authAccounts`)
- `id`: unique identifier (UUID) generated on creation.
- `userId`: reference to `users.id` (UUID).
- `provider`: federated identity provider identifier (required string, max length 50, e.g., `"google"`).
- `providerUserId`: unique user identifier returned by the external provider (required string, max length 255).
- `createdAt`: creation timestamp (`Date` or ISO datetime string depending on boundary).

## 3. Constraints and Integrity Rules
- `users.email` must be a valid email format and handled consistently (e.g., normalized casing) to prevent duplicate user records.
- `authAccounts.userId` must reference an existing record in `users`.
- The pair `(provider, providerUserId)` must be unique so the same external provider account cannot be duplicated.

## 4. Schema and Naming Rules
- Follow `ADR-002` and `SPEC-008`: `camelCase` for Zod schema variables (e.g., `userSchema`, `createUserSchema`, `authAccountSchema`, `createAuthAccountSchema`) and `PascalCase` for `z.infer` types (e.g., `User`, `CreateUserInput`, `AuthAccount`, `CreateAuthAccountInput`).
- Keep Drizzle table schemas in dedicated database schema files[cite: 5, 10] and use pure Zod schemas for application contracts[cite: 8].
- Do not store raw passwords or expose sensitive auth tokens unnecessarily in domain schemas.

## 5. Out of Scope for this PoC
- Email/password local credentials tables.
- Multi-provider UI flows or complex account-merging rules beyond preparing the data structure.
- Fine-grained RBAC/permission tables beyond the organizer role needed for the PoC.