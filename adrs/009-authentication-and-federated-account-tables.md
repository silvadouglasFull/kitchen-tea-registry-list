# ADR-009: Authentication and Federated Account Tables

- **Status:** Accepted for PoC
- **Date:** 2026-11-23

## Context
The PoC uses Google OAuth 2.0 for organizer sign-in[cite: 2, 13] and stores relational data in PostgreSQL managed with Drizzle ORM[cite: 1, 5, 10]. Although Google is the only provider in the PoC[cite: 2, 13], the client plans to support multiple federated login providers in the future.

## Decision
Model authentication persistence across two separate tables:
1. A core user table (`users`) holding the application-level user identity (`id`, `name`, `email`, `createdAt`).
2. A linked provider accounts table (`authAccounts`) holding federated provider records (`id`, `userId`, `provider`, `providerUserId`, `createdAt`), with a foreign key referencing `users.id` and a unique constraint on `(provider, providerUserId)`.

Application validation and inferred TypeScript types will use pure Zod schemas following project naming conventions (`camelCase` for schema variables, `PascalCase` for inferred types)[cite: 8], separate from Drizzle ORM table definitions[cite: 5, 8].

## Consequences / Trade-offs
- **Pros:**
  - Allows linking multiple OAuth/federated providers to a single user account over time without altering the core user identity model.
  - Keeps provider-specific identifiers isolated from core user attributes.
  - Preserves a clean boundary between database persistence (Drizzle) and application contracts (Zod)[cite: 8].
- **Cons / Risks:**
  - Requires a join or two-step lookup during sign-in and account linking flows.
  - Account-linking rules (such as matching existing emails across providers) must be explicitly defined when new providers are added.