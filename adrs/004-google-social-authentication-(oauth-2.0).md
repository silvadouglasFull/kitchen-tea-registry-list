# ADR-004: Google Social Authentication (OAuth 2.0)

- **Status:** Accepted for PoC
- **Date:** 2026-11-19

## Context
List organizers need a frictionless way to sign in and manage their bridal shower lists without building a custom password system or operating an identity provider from scratch[cite: 2].

## Decision
Delegate authentication to **Google** using OAuth 2.0 / native Next.js authentication capabilities, treating the application as a client relying on Google as the identity provider[cite: 2].

## Consequences / Trade-offs
- **Pros:**
  - Faster PoC delivery and reduced authentication maintenance burden.
  - Familiar login experience for organizers using existing Google accounts[cite: 2].
- **Cons / Risks:**
  - Depends on external Google OAuth configuration (client credentials, redirect URIs, and consent screen setup)[cite: 2].
  - Users without a Google account cannot sign in directly unless another provider is added later.