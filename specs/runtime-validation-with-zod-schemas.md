# SPEC-006: Runtime Validation with Zod Schemas

## 1. Overview

This specification defines the validation strategy for the Bridal Shower List application.

Zod will be the standard solution for runtime data validation and TypeScript type inference across the application. The approach prioritizes explicit validation flows, predictable behavior, and reduced implementation complexity during the PoC.

Custom decorators will not be used for function input/output validation in this phase.

## 2. Objectives

- Standardize runtime validation using Zod schemas.
- Infer TypeScript types directly from validation schemas using `z.infer`.
- Maintain a single source of truth for validation rules and inferred types.
- Ensure inputs and data objects are validated at appropriate application boundaries.
- Avoid unnecessary decorator metadata configuration and additional complexity.
- Keep creation, update, and domain/output contracts appropriately separated.

## 3. Scope

### 3.1. In Scope

- Use Zod for runtime validation.
- Use `z.infer` to derive TypeScript types from schemas.
- Validate data entering Server Actions, services, and other relevant application boundaries.
- Define separate schemas for creation, update, and domain/output data where appropriate.
- Use `.parse()` or `.safeParse()` explicitly.
- Keep validation schemas aligned with domain and persistence contracts.

### 3.2. Out of Scope

- Custom decorators for function input/output validation.
- Automatic validation through decorator metadata.
- Introducing additional validation frameworks.
- Building a generic decorator-based validation infrastructure.
- Replacing Zod with another validation library during the PoC.

## 4. Technology Requirements

### 4.1. Zod

**Technology:** Zod

Zod must be used as the standard library for runtime validation and TypeScript type inference.

Installation:

```bash
npm install zod
```

Schemas must define the expected structure and validation rules for application data.

### 4.2. Type Inference

TypeScript types should be inferred directly from Zod schemas using `z.infer`.

Example:

```typescript
import { z } from 'zod';

export const createRegistrySchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});

export type CreateRegistryInput = z.infer<typeof createRegistrySchema>;
```

This approach avoids duplicating validation rules and TypeScript type definitions.

## 5. Schema Organization

Schemas must be organized according to their purpose and data contracts.

### 5.1. Creation Schemas

Creation schemas define the required and optional fields when creating new resources.

Example:

```typescript
import { z } from 'zod';

export const createRegistrySchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});

export type CreateRegistryInput = z.infer<typeof createRegistrySchema>;
```

### 5.2. Update Schemas

Update schemas define the fields that can be modified when updating existing resources.

They should reflect update-specific requirements rather than automatically reusing the creation contract when their validation rules differ.

Example:

```typescript
import { z } from 'zod';

export const updateRegistrySchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
});

export type UpdateRegistryInput = z.infer<typeof updateRegistrySchema>;
```

### 5.3. Domain and Output Schemas

Domain and output schemas define the expected structure of data used internally or returned by application operations.

They must remain independent from creation and update contracts when their responsibilities or fields differ.

Persistence-specific details should not be exposed unnecessarily through application output contracts.

## 6. Validation Strategy

### 6.1. Validation Boundaries

Runtime validation must occur at appropriate application boundaries, including:

- Server Actions receiving external or user-provided input.
- API Routes receiving request payloads.
- External service integrations.
- Other entry points where data enters the application.

Services and repositories must receive data according to their expected contracts.

### 6.2. Validation Methods

Zod provides two primary validation methods:

**`.parse()`**

Use when invalid data should immediately produce a validation exception.

```typescript
const input = createRegistrySchema.parse(payload);
```

**`.safeParse()`**

Use when validation errors should be handled explicitly through the returned result.

```typescript
const result = createRegistrySchema.safeParse(payload);

if (!result.success) {
  return {
    success: false,
    errors: result.error.flatten(),
  };
}

const input = result.data;
```

The choice between these methods must consider the error-handling requirements of the operation.

### 6.3. Validation Flow

The expected validation flow is:

1. Receive input from an application boundary.
2. Validate the input using the corresponding Zod schema.
3. Handle validation failures according to the operation's error-handling strategy.
4. Pass validated and correctly typed data to the application service.
5. Execute business operations using the expected contracts.

## 7. Implementation Guidelines

- Use Zod as the standard validation library throughout the application.
- Infer TypeScript types using `z.infer` whenever types correspond directly to schemas.
- Keep creation, update, and domain/output schemas separated when appropriate.
- Avoid duplicating validation rules in separate TypeScript interfaces or types.
- Validate untrusted data before passing it into business operations.
- Keep schemas aligned with domain and persistence contracts as fields evolve.
- Use `.parse()` and `.safeParse()` consistently according to the expected error-handling behavior.
- Avoid custom decorators for input/output validation during the PoC.

## 8. Testing Requirements

The implementation must include tests covering:

- Valid payloads being accepted by their corresponding schemas.
- Invalid payloads being rejected.
- Required fields being enforced.
- Optional fields being handled correctly.
- Creation and update schemas enforcing their respective contracts.
- Type inference remaining consistent with schema definitions.
- Validation failures being handled correctly at application boundaries.

## 9. Acceptance Criteria

- [ ] Zod is installed and used as the standard runtime validation library.
- [ ] TypeScript types are inferred from schemas using `z.infer` where appropriate.
- [ ] Creation, update, and domain/output schemas are separated when their contracts differ.
- [ ] Server Actions validate incoming data before executing business operations.
- [ ] API Routes validate incoming payloads where applicable.
- [ ] Validation errors are handled consistently.
- [ ] Schemas remain aligned with domain and persistence contracts.
- [ ] Custom decorators are not used for function input/output validation during the PoC.

## 10. Risks and Mitigations

| Risk | Mitigation |
|---|---|
| Zod schemas become inconsistent with domain contracts. | Review and update schemas whenever domain fields or rules change. |
| Zod schemas become inconsistent with persistence contracts. | Keep data contracts aligned and review affected schemas during database changes. |
| Validation is inconsistently applied across the application. | Standardize explicit validation at application boundaries. |
| Incorrect use of `.parse()` or `.safeParse()` leads to inconsistent error handling. | Define and follow consistent error-handling conventions for each operation. |
| Validation logic becomes unnecessarily duplicated. | Reuse appropriate schemas and infer TypeScript types with `z.infer`. |

## 11. Future Considerations

Custom decorators may be reconsidered after the PoC if a specific cross-cutting requirement demonstrates a clear benefit that justifies their additional complexity.

Any future adoption must be supported by a concrete use case rather than introduced preemptively.

## 12. Expected Deliverable

A consistent validation foundation using Zod schemas, with runtime validation and inferred TypeScript types across the application, providing explicit and maintainable data contracts without requiring custom decorator-based validation infrastructure.