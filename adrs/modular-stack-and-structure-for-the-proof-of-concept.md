# ADR-001: Stack and Modular Structure for the PoC

- **Status:** Accepted for PoC
- **Date:** 2026-11-19

## Context
We need to develop a simple, low-cost Proof of Concept (PoC) to validate a "kitchen tea" (bridal shower/registry) gift list system with the client before finalizing the contract. Breaking the system down into multiple independent microservices at this early stage would unnecessarily increase costs, setup time, and potential points of failure during deployment[cite: 4].

## Decision
We will use Next.js, PostgreSQL, OAuth authentication via Google, and Cloudflare R2 (for optional images). The project will be structured into well-defined modules with low coupling and clear boundaries—separating business logic from data persistence—rather than using network-separated microservices at this stage[cite: 4]. Access to services and repositories will primarily occur server-side via "actions," which limits exposure on the client side; automated documentation via OpenAI will be reserved for the few API endpoints that do exist.

## Consequences / Trade-offs
- **Pros:**
- Low hosting costs and reduced operational complexity for the PoC[cite: 4]. 
- Explicit dependencies and a minimized "ripple effect" when changes are made while the scope is still being validated with the client. 
- Simplifies the transition to independent services in the future, should the product grow and require such decoupling[cite: 4].
- **Cons / Risks:**
- Requires discipline to ensure responsibilities do not become blurred across modules, actions, services, and repositories[cite: 4]. 
- If the project eventually requires independent scalability for specific services, an additional extraction step will be necessary.