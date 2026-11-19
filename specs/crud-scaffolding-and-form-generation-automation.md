# SPEC-008: CRUD Scaffolding and Form Generation Automation

## 1. Overview

This specification defines the tools and conventions for automating repetitive CRUD development tasks in the Bridal Shower List application.

The automation stack consists of:

- **Plop.js:** Backend module scaffolding.
- **Zod:** Application validation schemas and TypeScript type inference.
- **shadcn-zod-form:** Static React form generation from Zod schemas.
- **Drizzle ORM:** Database operations and persistence.

The objective is to accelerate development while preserving the modular architecture, architectural boundaries, and code quality requirements established by the project specifications.

## 2. Objectives

- Automate repetitive CRUD scaffolding.
- Standardize the structure of domain modules.
- Generate backend boilerplate through Plop.js.
- Generate physical `.tsx` forms through shadcn-zod-form.
- Maintain independent application contracts using pure Zod schemas.
- Avoid unnecessary LLM usage for deterministic development tasks.
- Ensure generated code is maintainable, customizable, and compatible with ESLint.

## 3. Scope

### 3.1. In Scope

- Configure Plop.js as the backend scaffolding tool.
- Create a module generator accessible through `npx plop module`.
- Generate the required modular directory structure and initial backend files.
- Define application contracts using pure Zod schemas.
- Generate forms through the shadcn-zod-form CLI.
- Integrate generated forms with React Hook Form and shadcn/ui.
- Connect generated Server Actions to application services.
- Ensure repositories use Drizzle ORM.
- Validate generated code through ESLint.

### 3.2. Out of Scope

- Automatically generating all business rules.
- Automatically generating database migrations.
- Generating application contracts from Drizzle schemas.
- Using `drizzle-zod` for application input/output contracts.
- Using AutoForm or runtime form generation.
- Automatically implementing complex domain workflows.
- Introducing Kirimase or alternative flat module architectures.
- Replacing developer review with automatic code generation.

## 4. Technology Requirements

### 4.1. Plop.js

Plop.js must be used to generate backend module structures and boilerplate files.

Installation:

```bash
npm install -D plop
```

The project must provide a Plop configuration and templates for generating modules.

The generator must be accessible through:

```bash
npx plop module
```

### 4.2. Zod

Zod must remain the standard library for application validation and TypeScript type inference.

Application schemas must be written independently using `z.object(...)` and other native Zod APIs.

The implementation must not use `drizzle-zod` to generate application contracts.

### 4.3. shadcn-zod-form

Use the shadcn-zod-form CLI to generate static React form components from application Zod schemas.

Expected command:

```bash
npx shadcn-zod-form@latest generate
```

The generation process must receive the appropriate creation or update schema as its input.

The generated component must be a physical `.tsx` file within the corresponding module's presentation layer.

### 4.4. Drizzle ORM

Repositories must use Drizzle ORM for database operations.

Drizzle table definitions may be consulted as references when creating application contracts, but must not be used as the source of application input/output schemas.

## 5. Modular Architecture

Every generated module must follow this exact directory structure:

```text
src/
  modules/
    <module-name>/
      domain/
        schemas/
          <module>.schema.ts

      application/
        schemas/
          create-<module>.schema.ts
          update-<module>.schema.ts

        services/
          <module>-service.ts

        actions/
          create-<module>-action.ts
          update-<module>-action.ts

      infrastructure/
        repositories/
          <module>-repository.ts

      presentation/
        components/
          create-<module>-form.tsx
          update-<module>-form.tsx
```

Each layer must have a clearly defined responsibility.

### 5.1. Domain

Contains domain-related schemas and contracts.

The domain schema must represent the application's domain/output data without exposing sensitive or unnecessary persistence information.

### 5.2. Application

Contains creation and update schemas, services, and Server Actions.

Schemas define the accepted input contracts for application operations.

Services implement business rules and must receive validated data.

Server Actions validate incoming data before invoking services.

### 5.3. Infrastructure

Contains repositories responsible exclusively for database persistence operations using Drizzle ORM.

Repositories must not expose Drizzle-specific types or query structures outside the persistence layer.

### 5.4. Presentation

Contains physical React components generated through shadcn-zod-form.

Forms must remain editable and customizable using Tailwind CSS and shadcn/ui components.

## 6. Plop.js — Backend Scaffolding

### 6.1. Generator Requirements

The Plop generator must:

1. Request the module name.
2. Normalize the module name to `kebab-case`.
3. Generate the directory structure defined in this specification.
4. Generate the initial schema, service, repository, and Server Action files.
5. Apply the project's naming conventions.
6. Avoid generating duplicated or conflicting files.

### 6.2. Generated Files

For a module named `registry`, the generator must create:

```text
src/modules/registry/
  domain/
    schemas/
      registry.schema.ts

  application/
    schemas/
      create-registry.schema.ts
      update-registry.schema.ts

    services/
      registry-service.ts

    actions/
      create-registry-action.ts
      update-registry-action.ts

  infrastructure/
    repositories/
      registry-repository.ts

  presentation/
    components/
```

The generator must provide valid initial TypeScript structures without inventing business rules or database fields.

### 6.3. Generator Templates

Templates must be maintained separately from generated application code.

Recommended organization:

```text
plopfile.js
plop-templates/
  module/
    domain/
    application/
    infrastructure/
```

Templates must follow the same naming and architectural conventions as the generated files.

## 7. Zod — Application Contracts

### 7.1. Contract Independence

Application schemas must use pure Zod.

Drizzle table definitions may serve as a business reference when determining relevant fields, but application schemas must be independently defined.

The following is prohibited:

```typescript
import { createInsertSchema } from 'drizzle-zod';
```

### 7.2. Creation Schema

Creation schemas must explicitly define fields allowed during resource creation.

Internal database fields must be excluded, including:

- `id`
- `createdAt`
- `updatedAt`

Example:

```typescript
import { z } from 'zod';

/**
 * Defines the accepted input when creating a registry.
 */
export const createRegistrySchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});

/**
 * Represents the validated registry creation input.
 */
export type CreateRegistryInput = z.infer<typeof createRegistrySchema>;
```

### 7.3. Update Schema

Update schemas must explicitly define which fields can be modified.

Internal database fields must not be accepted as update inputs unless a specific business requirement justifies it.

Example:

```typescript
import { z } from 'zod';

/**
 * Defines the accepted input when updating a registry.
 */
export const updateRegistrySchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
});

/**
 * Represents the validated registry update input.
 */
export type UpdateRegistryInput = z.infer<typeof updateRegistrySchema>;
```

The schema must reflect the actual update operation's requirements, including whether fields are optional or required.

### 7.4. Domain Schema

Domain schemas must define the data exposed by application operations.

They must not automatically expose every database field.

Types must be inferred using `z.infer`.

## 8. Backend Implementation Guidelines

### 8.1. Repository

The repository must:

- Be implemented in the corresponding module's infrastructure layer.
- Contain only persistence operations using Drizzle ORM.
- Provide the required CRUD operations.
- Avoid implementing business rules.
- Avoid exposing Drizzle-specific types outside the repository.

### 8.2. Service

The service must:

- Be implemented in the application layer.
- Contain business rules and application workflows.
- Receive data already validated by the Server Action.
- Use types inferred from the corresponding Zod schemas.
- Coordinate repository operations when necessary.

### 8.3. Server Actions

Server Actions must:

- Be implemented in the application layer.
- Use the `'use server'` directive.
- Validate incoming data using the corresponding application Zod schema.
- Use `.safeParse()` to handle validation failures explicitly.
- Invoke the corresponding service only after successful validation.
- Return controlled errors without exposing database internals.

Expected execution flow:

```text
Client Form
    |
    v
Server Action
    |
    v
Zod Validation
    |
    +---- Invalid Input ----> Controlled Validation Error
    |
    v
Application Service
    |
    v
Repository
    |
    v
Drizzle ORM
    |
    v
PostgreSQL
```

## 9. Form Generation with shadcn-zod-form

### 9.1. Generation Requirements

Forms must be generated from the corresponding application Zod schemas.

The generator must produce physical `.tsx` files.

Runtime form generation and AutoForm must not be used.

### 9.2. Creation Form

For a module named `registry`, the creation form must use:

```bash
npx shadcn-zod-form@latest generate
```

The generation process must point to:

```text
src/modules/registry/application/schemas/create-registry.schema.ts
```

The generated file must be located at:

```text
src/modules/registry/presentation/components/create-registry-form.tsx
```

### 9.3. Update Form

The update form must use the corresponding update schema:

```text
src/modules/registry/application/schemas/update-registry.schema.ts
```

The generated component must be located at:

```text
src/modules/registry/presentation/components/update-registry-form.tsx
```

### 9.4. Generated Form Requirements

Generated forms must:

- Use React Hook Form.
- Use `zodResolver` for validation.
- Use standard shadcn/ui components from `@/components/ui/*`.
- Remain compatible with Tailwind CSS customization.
- Use the corresponding Zod schema.
- Integrate with the appropriate Server Action.
- Provide controlled submission and validation feedback.
- Avoid unnecessary dependencies and unused imports.

The generated JSX must remain readable and editable.

## 10. Naming Conventions

All generated code must follow the conventions established in SPEC-002.

| Element | Convention | Example |
|---|---|---|
| Filenames | kebab-case | `registry-service.ts` |
| Variables | camelCase | `registryData` |
| Functions | camelCase | `createRegistry` |
| Objects | camelCase | `registryRepository` |
| Classes | camelCase | `registryService` |
| Schema variables | camelCase | `createRegistrySchema` |
| TypeScript types | PascalCase | `CreateRegistryInput` |
| React components | PascalCase | `CreateRegistryForm` |

TypeScript types must be inferred from Zod schemas using `z.infer<typeof schema>` whenever they correspond to those schemas.

Manual duplication of schema-derived interfaces or types must be avoided.

## 11. Quality Assurance and ESLint

### 11.1. Code Quality

All generated code must comply with the project's ESLint configuration.

The following conditions are mandatory:

- No unused variables.
- No unused imports.
- No lint errors.
- No lint warnings.
- No unnecessary type duplication.
- No violations of the modular architecture.
- No direct Drizzle access outside the repository layer.

### 11.2. Validation Command

The generated code must pass:

```bash
npm run lint
```

### 11.3. Generator Validation

Plop templates and generated forms must be reviewed and tested to ensure that the generated code is compatible with the project's current dependencies and conventions.

## 12. Testing Requirements

The implementation must include tests covering:

- Plop module generation.
- Correct directory and file creation.
- Correct naming conventions.
- Correct Zod schema generation.
- Correct TypeScript type inference.
- Server Action validation using `.safeParse()`.
- Repository integration with Drizzle ORM.
- Form generation from creation and update schemas.
- Generated form integration with React Hook Form and shadcn/ui.
- ESLint compatibility of generated code.

## 13. Acceptance Criteria

- [ ] Plop.js is installed and configured.
- [ ] The `npx plop module` command generates a modular backend structure.
- [ ] Generated filenames follow `kebab-case`.
- [ ] Generated classes follow the `camelCase` convention established by ADR-002.
- [ ] The generator creates domain, application, and infrastructure files.
- [ ] Application schemas use pure Zod.
- [ ] `drizzle-zod` is not used for application input/output contracts.
- [ ] Creation schemas exclude internal database fields.
- [ ] Update schemas explicitly define the permitted editable fields.
- [ ] TypeScript types are inferred using `z.infer`.
- [ ] Repositories use Drizzle ORM exclusively for persistence operations.
- [ ] Services contain business rules and receive validated data.
- [ ] Server Actions validate inputs using `.safeParse()` before invoking services.
- [ ] shadcn-zod-form is configured and usable through its CLI.
- [ ] Creation and update forms can be generated from their respective Zod schemas.
- [ ] Generated forms are physical `.tsx` files.
- [ ] Generated forms use React Hook Form and `zodResolver`.
- [ ] Generated forms use standard shadcn/ui components.
- [ ] Generated code passes `npm run lint` without errors or warnings.

## 14. Risks and Mitigations

| Risk | Mitigation |
|---|---|
| Plop templates become inconsistent with the architecture. | Maintain and review templates whenever architectural conventions change. |
| Generated code contains unnecessary boilerplate. | Keep templates minimal and focused on the required structure. |
| Application contracts become coupled to Drizzle schemas. | Enforce pure Zod schemas for application contracts. |
| Generated forms require excessive customization. | Keep generated JSX simple and editable. |
| CLI-generated code becomes incompatible with dependencies. | Validate generator output against the project's installed versions. |
| Developers rely on generated code without reviewing it. | Require code review and ESLint validation. |
| Repetitive tasks continue to rely unnecessarily on LLMs. | Prefer deterministic generators for scaffolding and form creation. |

## 15. Expected Deliverable

A reusable development automation foundation containing:

- A configured Plop.js module generator.
- Templates for generating modular backend CRUD structures.
- Independent Zod application schemas.
- A standardized shadcn-zod-form CLI workflow.
- Physical React form components generated from Zod schemas.
- Backend conventions for integrating Server Actions, services, repositories, and Drizzle ORM.
- Automated quality validation through ESLint.

The final solution must allow developers to create the initial structure of a new CRUD module and generate its forms without manually repeating boilerplate implementation tasks or relying on LLMs for deterministic code generation.