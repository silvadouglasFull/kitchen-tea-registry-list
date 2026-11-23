# Task 002: Code Standards, Zod Contracts, and CRUD/Form Automation

## Objective
Establish code quality standards, ESLint enforcement, pure Zod schema contracts, and deterministic scaffolding/form generation (`Plop.js` and `shadcn-zod-form`) for the Bridal Shower List PoC without using `drizzle-zod` or runtime form generators (`AutoForm`)[cite: 1, 3, 4].

## Context & References
- `SPEC-002`: Code Standards, Naming Conventions, and Data Validation with Zod[cite: 4]
- `ADR-002`: Naming Conventions, ESLint, and Schemas with Zod[cite: 4]
- `SPEC-006`: Runtime Validation with Zod Schemas
- `ADR-006`: Validation Strategy — Zod Schemas vs. Decorators
- `SPEC-008`: CRUD Scaffolding and Form Generation Automation[cite: 1]
- `docs/templates/zod-schema-template.md`

## Execution Steps
1. **Install Core Standard & Automation Dependencies:**
   - Install `zod` (`npm install zod`)[cite: 1, 4].
   - Install `plop` as a dev dependency (`npm install -D plop`)[cite: 1].
   - Configure `shadcn-zod-form` CLI usage for generating physical `.tsx` form components from Zod schemas paired with React Hook Form, `zodResolver`, `shadcn/ui`, and Tailwind CSS[cite: 1, 3].
2. **Configure ESLint and Naming Rules:**
   - Ensure ESLint is configured for Next.js and TypeScript with zero errors or warnings[cite: 1, 3].
   - Enforce naming conventions across all files and generated templates:
     - Filenames: `kebab-case` (e.g., `registry-service.ts`)[cite: 1, 3].
     - Variables, functions, objects, classes, and Zod schema variables: `camelCase` (e.g., `createRegistrySchema`, `registryService`)[cite: 1, 3].
     - Inferred TypeScript types (`z.infer<typeof schema>`) and React components: `PascalCase` (e.g., `CreateRegistryInput`, `CreateRegistryForm`)[cite: 1, 3].
3. **Standardize Pure Zod Contracts:**
   - Follow `docs/templates/zod-schema-template.md` and separate creation, update, and domain/output schemas where contracts differ[cite: 1, 3].
   - Infer TypeScript types via `z.infer<typeof schema>`[cite: 1, 3].
   - **Do not** use `drizzle-zod` to generate application contracts, and **do not** use custom decorators for function input/output validation[cite: 1, 3].
4. **Configure Plop.js Module Scaffolding:**
   - Create `plopfile.js` and templates under `plop-templates/module/` (`domain/`, `application/`, `infrastructure/`) accessible via `npx plop module`[cite: 1].
   - Normalize module names to `kebab-case`, avoid duplicate/conflicting files, and generate initial structure for schemas, services, repositories, and Server Actions (validating with `.safeParse()` before invoking services)[cite: 1, 3].
5. **Verify Quality & Automation:**
   - Test `npx plop module` and form generation on a sample or initial module[cite: 1].
   - Run `npm run lint` and verify zero errors or warnings[cite: 1, 3].

## Out of Scope
- Automatically generating all business rules or complex domain workflows[cite: 1].
- Automatically generating database migrations from Zod or Drizzle schemas[cite: 1].
- Using `drizzle-zod` for application input/output contracts[cite: 1, 3].
- Using `AutoForm`, runtime form generation, or Kirimase/flat module structures[cite: 1, 3].

## Acceptance Criteria
- [ ] `zod` and `plop` (`-D`) are installed, and `shadcn-zod-form` CLI is configured[cite: 1].
- [ ] ESLint enforces project rules and `npm run lint` passes with zero errors or warnings[cite: 1].
- [ ] `npx plop module` generates `kebab-case` files across `domain/`, `application/`, and `infrastructure/` following `camelCase` / `PascalCase` conventions[cite: 1, 3].
- [ ] Zod schemas use `z.infer` without `drizzle-zod` or custom validation decorators, and Server Actions validate inputs using `.safeParse()`[cite: 1, 3].
- [ ] Generated `.tsx` forms are physical files using React Hook Form, `zodResolver`, `shadcn/ui`, and Tailwind CSS (no `AutoForm` or runtime generation)[cite: 1, 3].