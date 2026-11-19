# ADR-002: Naming Conventions, ESLint, and Schemas with Zod

- **Status:** Accepted for PoC
- **Date:** 2026-11-19

## Context
Keeping the codebase readable, expressive, and consistent from the PoC stage avoids rework and facilitates rapid changes based on client feedback[cite: 2]. Defining data contracts explicitly also helps prevent breaking compatibility and type inconsistencies between layers[cite: 7].

## Decision
Adopt standardization rules via ESLint and specific naming conventions:
- Use `kebab-case` for filenames consisting of more than one word.
- Use `camelCase` for classes, variables, and object names (ensuring names are clear and reveal the intent of the data or function)[cite: 2, 5].
- Use **Zod** schemas to validate inputs/outputs and automatically derive types (`z.infer`), separating creation, update, and domain/output contracts to avoid excessive coupling[cite: 7].

## Consequences / Trade-offs
- **Pros:**
- A single source of truth for both runtime validation and static typing. 
- More standardized code that is easier to read and refactor safely[cite: 2, 5].
- **Cons / Risks:**
- Requires careful management of schema evolution to avoid breaking internal consumers when adding or modifying fields[cite: 7]. 
- Highly strict linting rules may require occasional adjustments during the initial phase until the workflow becomes intuitive.