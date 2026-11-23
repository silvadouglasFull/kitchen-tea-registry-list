# ADR-003: Stack and PostgreSQL Database Selection

- **Status:** Accepted for PoC
- **Date:** 2026-11-19

## Context
We need a low-cost, fast-to-build Proof of Concept (PoC) for a Bridal Shower List application before signing a contract. Choosing unfamiliar or expensive infrastructure would slow down validation and increase hosting and maintenance costs unnecessarily[cite: 6].

## Decision
Use **Next.js** for the web application/server layer and **PostgreSQL** as the relational database, relying on technologies already known to the developer and cost-effective hosting options[cite: 6].

## Consequences / Trade-offs
- **Pros:**
  - Low hosting and setup cost for an early-stage PoC.
  - Faster development and maintenance due to existing team familiarity and long-term supportability[cite: 6].
  - Structured relational persistence well suited to entities such as lists, items, and user profiles.
- **Cons / Risks:**
  - Schema changes and migrations must be kept disciplined as requirements evolve after client feedback.
  - If the product grows significantly later, database scaling and query tuning will require attention.