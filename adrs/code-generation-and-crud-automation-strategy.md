# ADR-008: Code Generation and CRUD Automation Strategy

- **Status:** Accepted for PoC
- **Date:** 2026-11-19

## Context

The application requires a consistent and repeatable development workflow for implementing CRUD operations across its domain modules.

Manually creating folders, schemas, services, repositories, Server Actions, and forms for every new module introduces repetitive work, increases the possibility of inconsistencies, and consumes development time.

The project also aims to reduce unnecessary reliance on LLMs for tasks that can be performed deterministically through code generation tools.

The automation strategy must respect the modular architecture defined in the project specifications, maintain separation between persistence and application contracts, and produce statically analyzable TypeScript and React code.

## Decision

Adopt the following tools as the standard development automation stack:

### 1. Plop.js — Backend Scaffolding

Use **Plop.js** to generate the initial structure and boilerplate files for domain modules and CRUD operations.

The generator must create the modular directory structure, following the project's naming conventions and architectural boundaries.

Generated files must include the initial structure for:

- Domain schemas.
- Application creation and update schemas.
- Services.
- Repositories.
- Server Actions.

### 2. Zod — Application Contracts

Use pure Zod schemas for application input, output, and domain contracts.

The application must not use `drizzle-zod` to generate external application contracts, avoiding coupling between database persistence definitions and application validation rules.

TypeScript types must be inferred using `z.infer<typeof schema>`.

### 3. shadcn-zod-form — Form Generation

Use **shadcn-zod-form** to generate physical `.tsx` form components from application Zod schemas.

Generated forms must use:

- React Hook Form.
- `zodResolver`.
- shadcn/ui components.
- Tailwind CSS-compatible JSX.

Runtime-generated forms and `AutoForm` must not be used.

### 4. Architectural Standards

All generated code must follow SPEC-002 and the modular architecture defined for the application.

The following rules are mandatory:

- Filenames must use `kebab-case`.
- Variables, functions, and objects must use descriptive `camelCase`.
- Class names must follow the `camelCase` convention established by ADR-002.
- TypeScript types must be inferred from Zod schemas.
- Repositories must contain database access operations using Drizzle ORM.
- Services must contain business rules.
- Server Actions must validate incoming data before invoking services.
- Generated code must pass the project's ESLint checks.

## Consequences / Trade-offs

### Pros

- Reduces repetitive implementation work.
- Standardizes CRUD structure across domain modules.
- Reduces architectural inconsistencies.
- Avoids unnecessary LLM usage for deterministic scaffolding and form generation.
- Maintains separation between database schemas and application contracts.
- Produces physical source files that can be reviewed, customized, and maintained.
- Improves development speed and consistency.

### Cons / Risks

- Generators require initial implementation and maintenance.
- Generated boilerplate may require manual adjustments for specific business rules.
- Changes to architectural conventions may require updating generator templates.
- Generated forms and backend files must remain compatible with the project's dependencies and linting rules.
- Developers must review generated code rather than assuming it is automatically correct.

## References

- SPEC-002: Code Standards, Naming Conventions, and Data Validation with Zod.
- SPEC-007: Database Access and Migration Management with Drizzle ORM.
- Plop.js: https://plopjs.com/
- shadcn-zod-form: https://github.com/felixfischer/shadcn-zod-form
- shadcn/ui: https://ui.shadcn.com/
- Zod: https://zod.dev/