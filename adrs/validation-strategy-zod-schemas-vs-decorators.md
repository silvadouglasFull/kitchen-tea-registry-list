# ADR-006: Validation Strategy — Zod Schemas vs. Decorators

- **Status:** Accepted for PoC
- **Date:** 2026-11-19

## Context
Inputs, payloads, function parameters, and data objects flow across server actions, services, and repositories. We want runtime validation and static TypeScript types without adding unnecessary compiler or runtime complexity during the PoC.

## Decision
Standardize runtime validation and type inference (`z.infer`) on **Zod** schemas (separating creation, update, and domain/output schemas where appropriate) rather than relying on custom **decorators** for function input/output validation in the PoC. Decorators may be revisited later only if a specific cross-cutting need clearly justifies the added complexity.

## Consequences / Trade-offs
- **Pros:**
  - Single source of truth for runtime validation rules and inferred TypeScript types.
  - Explicit, predictable validation flow without extra decorator metadata configuration.
- **Cons / Risks:**
  - Requires keeping Zod schemas aligned with domain and persistence contracts as fields evolve.
  - Calling `.parse()` / `.safeParse()` explicitly at boundaries requires consistent team discipline.