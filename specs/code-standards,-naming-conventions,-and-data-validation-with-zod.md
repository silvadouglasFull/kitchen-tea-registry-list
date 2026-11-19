# SPEC-002: Code Standards, Naming Conventions, and Data Validation with Zod

**Requirement:** NFR-002 - Code Quality and Data Contract Standardization

**Status:** Specification

**Date:** 2026-11-19

## 1. Overview

Establish code quality standards and data validation practices for the Kitchen Tea Gift Registry PoC.

The application must follow consistent naming conventions, use ESLint to enforce code quality rules, and adopt Zod as the standard solution for runtime data validation and TypeScript type inference.

These standards aim to improve readability, maintainability, consistency, and reduce errors during development and future changes.

---

## 2. Objectives

1. Standardize naming conventions across the codebase.
2. Configure ESLint to enforce consistent code quality rules.
3. Adopt Zod for runtime validation of application data.
4. Use Zod schemas as the single source of truth for validation and TypeScript types.
5. Separate schemas according to their responsibilities and data contracts.
6. Reduce coupling between input validation, business logic, and persistence.
7. Facilitate safe refactoring and future changes.

---

## 3. Scope

### Included

- ESLint configuration.
- Naming conventions for files, variables, classes, and objects.
- Zod installation and integration.
- Input and output validation.
- Schema organization by business responsibility.
- TypeScript type inference using `z.infer`.
- Validation of data received through Server Actions and API Routes.
- Reusable schemas where appropriate.

### Excluded from this PoC

- Complex validation frameworks.
- Automatic generation of API clients from Zod schemas.
- Automatic database schema generation from Zod.
- Runtime validation of every internal function call when the data is already trusted and validated.
- Advanced schema versioning infrastructure.

---

## 4. Naming Conventions

The following conventions must be applied consistently throughout the project.

### 4.1 File Names

Use `kebab-case` for filenames containing multiple words.

Examples:

```txt
registry-service.ts
registry-repository.ts
create-registry-action.ts
registry-schema.ts
user-profile.ts
```

### 4.2 Variables and Objects

Use `camelCase` for variables, functions, and object names.

Examples:

```ts
const registryName = "Kitchen Tea";

const organizerProfile = {
  name: "John Doe",
  email: "john@example.com",
};
```

Names must be descriptive and reveal the intent of the data or operation.

### 4.3 Classes

Use `camelCase` for class names, as defined in ADR-002.

Examples:

```ts
class registryService {}
class registryRepository {}
```

### 4.4 Constants

Use descriptive names and follow the project's ESLint conventions for constant declarations.

### 4.5 Consistency

Naming conventions must be applied consistently across all modules, including:

- Authentication.
- Registry.
- Items.
- Storage.
- Shared infrastructure.

---

## 5. ESLint Configuration

ESLint must be configured as the project's standard static code analysis tool.

Requirements:

1. Integrate ESLint with the Next.js and TypeScript environment.
2. Enforce consistent code quality rules.
3. Detect unused variables and imports.
4. Identify common programming errors.
5. Ensure consistent application of the project's coding conventions.
6. Allow rules to be adjusted when necessary, without compromising overall code consistency.

ESLint must be executable through a project script.

Example:

```json
{
  "scripts": {
    "lint": "eslint ."
  }
}
```

---

## 6. Zod Integration

### 6.1 Library

Install Zod:

```bash
npm install zod
```

Zod will be the standard library for runtime validation and TypeScript type inference.

### 6.2 Schema Definition

Data contracts must be defined using Zod schemas.

Example:

```ts
import { z } from "zod";

export const createRegistrySchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});

export type CreateRegistryInput = z.infer<
  typeof createRegistrySchema
>;
```

### 6.3 Runtime Validation

All untrusted data entering the application must be validated before being processed by business logic.

Validation must be performed at application boundaries, particularly:

- Server Actions.
- API Routes.
- External service integrations.
- User-provided form data.

Use `parse()` or `safeParse()` according to the error-handling requirements of each operation.

### 6.4 Type Inference

TypeScript types must be derived from Zod schemas whenever applicable.

Use:

```ts
type CreateRegistryInput = z.infer<
  typeof createRegistrySchema
>;
```

Avoid manually duplicating types that can be inferred from existing schemas.

---

## 7. Schema Organization

Schemas must be separated according to their responsibilities to avoid excessive coupling between different application layers.

### 7.1 Creation Schemas

Define the data required to create a resource.

Example:

```ts
export const createRegistrySchema = z.object({
  name: z.string().min(1),
});
```

### 7.2 Update Schemas

Define the data accepted when updating an existing resource.

Update schemas must explicitly represent which fields can be modified.

They must not automatically expose every field from the creation or domain schema.

### 7.3 Domain and Output Schemas

Define the data structures used internally by the application and the data returned to consumers.

These schemas must avoid exposing persistence-specific fields or sensitive information unnecessarily.

### 7.4 Schema Independence

Schemas must be organized according to their business responsibility.

Changes to a persistence-specific structure must not unnecessarily affect external input contracts or application output contracts.

Schema reuse is encouraged when the contracts genuinely represent the same data and have the same validation requirements.

---

## 8. Integration with Application Architecture

### 8.1 Server Actions

Server Actions must validate incoming data using the appropriate Zod schema before invoking application services.

### 8.2 Application Services

Services must receive validated and appropriately typed input data.

Business rules must remain inside application or domain layers rather than being implemented exclusively through input schemas.

### 8.3 Repositories

Repositories must receive data according to their persistence responsibilities.

Database-specific structures must not be unnecessarily exposed as public application contracts.

### 8.4 API Routes

API Routes must validate request payloads using Zod before processing operations.

Responses must follow explicitly defined output contracts when applicable.

---

## 9. Suggested Project Structure

```txt
src/
  modules/
    registry/
      domain/
        schemas/
          registry.schema.ts

      application/
        schemas/
          create-registry.schema.ts
          update-registry.schema.ts

        services/
          registry-service.ts

      infrastructure/
        repositories/
          registry-repository.ts

  shared/
    schemas/
    types/
```

The exact organization may evolve as modules become more complex, provided the separation of responsibilities is maintained.

---

## 10. Non-Functional Requirements

1. Code must follow the established naming conventions.
2. ESLint must be integrated into the development workflow.
3. Untrusted external data must undergo runtime validation.
4. Zod schemas must be the primary source of truth for inferred TypeScript types.
5. Schemas must have clearly defined responsibilities.
6. Changes to schemas must consider their impact on existing consumers.
7. Validation errors must be handled without exposing internal implementation details.
8. The project must maintain compatibility between runtime validation and static typing.

---

## 11. Testing

### 11.1 Unit Tests

- Validate successful schema parsing.
- Validate rejection of invalid data.
- Test required and optional fields.
- Test creation and update schema differences.
- Test inferred data contracts where applicable.

### 11.2 Integration Tests

- Verify Zod validation in Server Actions.
- Verify invalid payloads are rejected before reaching application services.
- Verify API Routes validate incoming request data.
- Verify application services receive correctly validated inputs.

### 11.3 Static Analysis

Run ESLint to identify code quality and convention violations.

---

## 12. Acceptance Criteria

1. ESLint is installed and configured for Next.js and TypeScript.
2. Naming conventions are consistently applied throughout the project.
3. Zod is installed and available for all business modules.
4. Application input contracts are defined using Zod where applicable.
5. TypeScript types are inferred using `z.infer`.
6. Untrusted data is validated before reaching business logic.
7. Creation, update, and domain/output schemas have clearly defined responsibilities.
8. Schemas do not unnecessarily depend on persistence-specific structures.
9. Server Actions and API Routes validate incoming data.
10. ESLint and automated tests execute successfully.

---

## 13. Risks and Mitigations

1. **Risk:** Changes to schemas break existing consumers.

   **Mitigation:** Review schema dependencies before modifying contracts and keep creation, update, and output schemas independent.

2. **Risk:** Excessively strict ESLint rules slow down initial development.

   **Mitigation:** Start with consistent, practical rules and adjust them as development needs become clearer.

3. **Risk:** Duplicate schemas introduce inconsistencies.

   **Mitigation:** Reuse schemas when their responsibilities and validation requirements are genuinely equivalent.

4. **Risk:** Validation logic becomes mixed with business rules.

   **Mitigation:** Keep structural validation in Zod schemas and business invariants in the appropriate application or domain layer.

---

## 14. Deliverable

A standardized development environment with ESLint, consistent naming conventions, and Zod-based data contracts, ensuring runtime validation, TypeScript type inference, and clear separation of responsibilities across application modules.