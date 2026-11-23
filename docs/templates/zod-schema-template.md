# Zod Schema Generation Template & LLM Instructions

When generating validation schemas and TypeScript contracts for this project, strictly follow the rules, directory structure, naming conventions, and examples defined below (aligned with **ADR-002**, **SPEC-002**, **SPEC-006**, and **SPEC-008**).

---

## 1. Core Rules

1. **Pure Zod Only:** Use `z.object(...)` and native Zod APIs. **NEVER** use `drizzle-zod` (`createInsertSchema`, `createSelectSchema`, etc.) to generate application contracts.
2. **Single Source of Truth for Types:** Always derive TypeScript types from Zod schemas using `z.infer<typeof schema>`. Never manually duplicate interfaces or types that correspond to a schema.
3. **Separation of Concerns:** Keep creation, update, and domain/output schemas separated according to their layer and responsibility:
   - **Domain / Output Schema:** `src/modules/<module-name>/domain/schemas/<module>.schema.ts`
   - **Creation Input Schema:** `src/modules/<module-name>/application/schemas/create-<module>.schema.ts`
   - **Update Input Schema:** `src/modules/<module-name>/application/schemas/update-<module>.schema.ts`
4. **Exclude Persistence Internals from Inputs:** Creation and update schemas must **not** accept internal database-managed fields (`id`, `createdAt`, `updatedAt`, `deletedAt`) unless explicitly required by a business rule.
5. **No Database Functions in Zod:** Do not use SQL expressions or functions (e.g., `gen_random_uuid()`, `CURRENT_TIMESTAMP`) inside Zod schemas.

---

## 2. Naming Conventions

| Element | Convention | Example |
| :--- | :--- | :--- |
| File names | `kebab-case` | `create-user.schema.ts`, `user.schema.ts` |
| Schema variables | `camelCase` | `createUserSchema`, `updateUserSchema`, `userSchema` |
| Object properties | `camelCase` | `userId`, `providerUserId`, `createdAt` |
| Inferred TypeScript types | `PascalCase` | `CreateUserInput`, `UpdateUserInput`, `User` |

---

## 3. Reference Examples

You must structure schemas following this exact pattern:

### Example 1: User Entity (`user`)

#### Creation Schema (`create-user.schema.ts`)
```typescript
import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().trim().min(1).max(255),
  email: z.string().trim().email().max(255),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
```

#### Domain / Output Schema (`user.schema.ts`)
```typescript
import { z } from "zod";
import { createUserSchema } from "../../application/schemas/create-user.schema";

export const userSchema = createUserSchema.extend({
  id: z.string().uuid(),
  createdAt: z.string().datetime(),
});

export type User = z.infer<typeof userSchema>;
```

---

### Example 2: Federated Auth Account Entity (`auth-account`)

#### Creation Schema (`create-auth-account.schema.ts`)
```typescript
import { z } from "zod";

export const createAuthAccountSchema = z.object({
  userId: z.string().uuid(),
  provider: z.string().trim().min(1).max(50),
  providerUserId: z.string().trim().min(1).max(255),
});

export type CreateAuthAccountInput = z.infer<typeof createAuthAccountSchema>;
```

#### Domain / Output Schema (`auth-account.schema.ts`)
```typescript
import { z } from "zod";
import { createAuthAccountSchema } from "../../application/schemas/create-auth-account.schema";

export const authAccountSchema = createAuthAccountSchema.extend({
  id: z.string().uuid(),
  createdAt: z.string().datetime(),
});

export type AuthAccount = z.infer<typeof authAccountSchema>;
```

---

### Example 3: Update Input Schema (`update-<module>.schema.ts`)

When an entity supports updates, explicitly define only the editable fields:

```typescript
import { z } from "zod";

export const updateUserSchema = z.object({
  name: z.string().trim().min(1).max(255).optional(),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
```

---

## 4. Checklist Before Outputting Schemas

- [ ] Are filenames in `kebab-case`?
- [ ] Are schema constant names in `camelCase`?
- [ ] Are inferred types exported in `PascalCase` using `z.infer<typeof ...>`?
- [ ] Are internal fields (`id`, `createdAt`, `updatedAt`) excluded from `create*Schema` and `update*Schema`?
- [ ] Is the schema 100% pure Zod without `drizzle-zod` imports?