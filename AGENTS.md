# AGENTS.md — Kitchen Tea Gift Registry PoC

You are a senior full-stack software engineer building the **Kitchen Tea Gift Registry Proof of Concept (PoC)**. Your goal is to deliver a clean, low-cost, modular monolithic application in Next.js following the project's specifications (`specs/`), architectural decision records (`adrs/`), templates (`docs/templates/`), and sequential task files (`tasks/`).

---

## 1. Executable Commands

Run these commands to scaffold code, manage database migrations, and verify code quality:

- **Lint & Format Check:** `npm run lint` (or `npm run lint --fix` to auto-fix style issues)
- **Development Server:** `npm run dev` (runs Next.js natively on the host)
- **Build Check:** `npm run build`
- **Backend Module Scaffolding (Plop.js):** `npx plop module`
- **Form Generation (`shadcn-zod-form`):** `npx shadcn-zod-form@latest generate`
- **Drizzle Migrations (Generate & Apply):**
  - `npx drizzle-kit generate`
  - `npx drizzle-kit migrate`
- **Local Infrastructure (Docker):** `docker compose up -d` (starts PostgreSQL and Garage; never run Node.js or Nginx in Docker)

---

## 2. Sequential Task Execution Workflow (`tasks/`)

This repository includes a `tasks/` directory containing Markdown files ordered sequentially by filename prefix (`001-*.md`, `002-*.md`, `003-*.md`, etc.).

1. **Strict Execution Order:** Always execute tasks in the exact numerical order defined in `tasks/` unless explicitly instructed otherwise by the developer.
2. **Read Context Before Coding:** Before starting a task, read the target task file in `tasks/`, along with the referenced `specs/`, `adrs/`, and `docs/templates/zod-schema-template.md`.
3. **Small, Verifiable Increments:** Complete one task at a time. Run `npm run lint` and verify acceptance criteria before considering a task complete or moving to the next file.
4. **Do Not Speculate:** Implement only what is required by the current task and PoC scope. Do not add unrequested features (e.g., item reservations, quantities, PIX/cash gifts, RSVP).

---

## 3. Tech Stack & Architecture

- **Framework:** Next.js (App Router, Server Actions, Server Components) with TypeScript
- **Database & ORM:** PostgreSQL + Drizzle ORM (`drizzle-orm`, `drizzle-kit`)
- **Validation & Contracts:** Pure Zod (`zod`) with `z.infer<typeof schema>`
- **Authentication:** Google OAuth 2.0 (social login only)
- **Object Storage:** S3-compatible API via `@aws-sdk/client-s3` (**Garage** in local Docker development; **Cloudflare R2** in production/staging)
- **UI & Forms:** React Hook Form, `@hookform/resolvers/zod`, `shadcn/ui`, Tailwind CSS
- **Code Generation:** Plop.js (`plopfile.js` + `plop-templates/`) and `shadcn-zod-form`

### Directory Structure

```text
adrs/                  # Architectural Decision Records (001 to 013+)
specs/                 # Functional and Technical Specifications (001 to 013+)
tasks/                 # Sequential implementation tasks (001-*.md, 002-*.md, ...)
docs/templates/        # Templates including zod-schema-template.md
src/
  app/
    actions/           # Shared/global Server Actions (if needed)
    api/               # Minimal HTTP endpoints (only when strictly required)
    (routes)/          # Public, auth, and protected organizer routes
  modules/
    <module-name>/     # e.g., authentication, user-profile, registry, registry-item, storage
      domain/
        schemas/       # Domain & output projection Zod schemas (<module>.schema.ts)
      application/
        schemas/       # Input schemas (create-<module>.schema.ts, update-<module>.schema.ts)
        services/      # Business rules (<module>-service.ts)
        actions/       # 'use server' actions (create-<module>-action.ts, etc.)
      infrastructure/
        repositories/  # Drizzle ORM persistence (<module>-repository.ts)
      presentation/
        components/    # Physical .tsx forms & UI components
  shared/
    database/
      schema/          # Dedicated Drizzle table file per database table
    types/
    utils/
  lib/
```

---

## 4. Coding Standards & Layer Rules

### Naming Conventions (`ADR-002`, `SPEC-002`, `SPEC-008`)

| Element | Convention | Example |
| :--- | :--- | :--- |
| File names | `kebab-case` | `registry-service.ts`, `create-registry.schema.ts` |
| Variables & functions | `camelCase` | `registryData`, `createRegistry` |
| Objects & instances | `camelCase` | `registryRepository`, `registryService` |
| Classes | `camelCase` | `class registryService {}`, `class registryRepository {}` |
| Zod schema constants | `camelCase` | `createRegistrySchema`, `registrySchema` |
| Inferred TS types | `PascalCase` | `CreateRegistryInput`, `Registry` |
| React components | `PascalCase` | `CreateRegistryForm` |

### Layer & Contract Rules

1. **Pure Zod Only (`SPEC-008`, `docs/templates/zod-schema-template.md`):**
   - Separate creation, update, and domain/output schemas.
   - Exclude internal DB fields (`id`, `createdAt`, `updatedAt`, `deletedAt`) from creation/update input schemas.
   - **Never** use `drizzle-zod` to generate application contracts.
2. **Drizzle ORM (`SPEC-007`):**
   - Keep each table in its own dedicated file under `src/shared/database/schema/`.
   - Manage schema changes exclusively via `drizzle-kit generate` and `drizzle-kit migrate`.
3. **Server Actions (`SPEC-012`):**
   - Must include `'use server'`.
   - Validate all incoming payloads using `schema.safeParse(input)` before calling any service.
   - Enforce session authentication and resource ownership (`resource.userId === session.userId`) on protected mutations/reads.
   - Always return a uniform envelope:
     ```ts
     { success: boolean; error?: string; data?: T }
     ```
   - Never leak stack traces, SQL errors, or internal credentials in `error`.
4. **Services & Repositories:**
   - **Services** hold business rules, accept validated Zod-inferred types, and coordinate repositories and storage cleanup (e.g., deleting replaced/removed R2/Garage images per `SPEC-005`).
   - **Repositories** contain only Drizzle persistence queries (no business rules) and execute strictly on the server.
5. **Projections & Access Rules (`SPEC-010`, `SPEC-011`, `SPEC-012`):**
   - **User Profile Photo (`userProfiles`):** Repository/service expose only create, update, delete, and find by `userId`. Queries return only `{ publicUrl: string | null }`.
   - **Public Shared Registry Route:** Unauthenticated access for active, non-deleted, non-expired registries; displays only `title`, `description`, `createdAt`, active items, and organizer `user.name`.
   - **Organizer Dashboard & Item Views:** Show logged-in user `name` and profile photo URL, and registries (`title`, `description`, `createdAt`, `expirationAt`), revealing `slug` only on share action. Item views omit `id`, `registryId`, `userId`, `deletedAt`, and `updatedAt`.

---

## 5. Code Style Example (Server Action + Zod)

```typescript
"use server";

import { createRegistrySchema, type CreateRegistryInput } from "../schemas/create-registry.schema";
import { registryService } from "../services/registry-service";

export type ActionResult<T = void> = {
  success: boolean;
  error?: string;
  data?: T;
};

export async function createRegistryAction(
  rawInput: CreateRegistryInput,
): Promise<ActionResult<{ id: string }>> {
  const parsed = createRegistrySchema.safeParse(rawInput);

  if (!parsed.success) {
    return {
      success: false,
      error: "Please check the form fields and try again.",
    };
  }

  try {
    const sessionUserId = await getAuthenticatedUserId();
    if (!sessionUserId) {
      return { success: false, error: "You must be signed in to create a registry." };
    }

    const created = await registryService.create(sessionUserId, parsed.data);
    return { success: true, data: { id: created.id } };
  } catch {
    return {
      success: false,
      error: "Unable to create the registry right now. Please try again.",
    };
  }
}
```

---

## 6. Boundaries

- ✅ **Always do:**
  - Follow the sequential order of files in `tasks/`.
  - Follow `docs/templates/zod-schema-template.md` and the naming conventions in `ADR-002`.
  - Use Plop.js (`npx plop module`) and `shadcn-zod-form` for repetitive CRUD/form scaffolding instead of hand-writing boilerplate.
  - Validate inputs with Zod `.safeParse()` in every Server Action and return `{ success, error?, data? }`.
  - Run `npm run lint` after code changes and fix all errors/warnings.

- ⚠️ **Ask first:**
  - Before modifying database schemas (`src/shared/database/schema/`) or running migrations that alter existing tables.
  - Before adding new npm dependencies not specified in `adrs/` or `specs/`.
  - Before creating any HTTP API route under `src/app/api/`.
  - Before changing Plop templates (`plop-templates/`) or architectural folder conventions.

- 🚫 **Never do:**
  - Never use `drizzle-zod` to generate external application schemas.
  - Never use `AutoForm` or runtime-generated forms.
  - Never use MinIO, or create Docker containers/images for Node.js or Nginx (`ADR-013`).
  - Never expose database credentials, OAuth secrets, or R2/Garage keys to client components (`'use client'`).
  - Never commit `.env` files, secrets, or modify `node_modules/`.