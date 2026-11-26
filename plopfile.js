/**
 * Plopfile — Backend Module Scaffolding (ADR-008 / SPEC-008)
 *
 * Usage:
 *   npx plop module
 *
 * Generates the full modular directory structure under src/modules/<module-name>/
 * following the kebab-case filename, camelCase variable, and PascalCase type
 * conventions defined in ADR-002 and SPEC-002.
 *
 * Generated layers:
 *   domain/schemas/           — domain/output Zod schema
 *   application/schemas/      — create & update input Zod schemas
 *   application/services/     — business-rules service
 *   application/actions/      — 'use server' Server Actions
 *   infrastructure/repositories/ — Drizzle ORM repository
 *   presentation/components/  — empty placeholder (forms generated via shadcn-zod-form)
 */

export default function plopConfig(plop) {
  // ── Helpers ────────────────────────────────────────────────────────────────

  /**
   * Convert a string to PascalCase.
   * Used for TypeScript types and React component names.
   */
  plop.setHelper("pascalCase", (text) => {
    return String(text)
      .replace(/([-_\s]+)(\w)/g, (_, __, c) => c.toUpperCase())
      .replace(/^\w/, (c) => c.toUpperCase());
  });

  // ── Module Generator ───────────────────────────────────────────────────────

  plop.setGenerator("module", {
    description: "Generate a new domain module (domain + application + infrastructure)",

    prompts: [
      {
        type: "input",
        name: "moduleName",
        message: "Module name (e.g. registry, registry-item, user-profile):",
        validate: (value) => {
          if (!value || value.trim().length === 0) {
            return "Module name is required.";
          }
          if (!/^[a-z][a-z0-9-]*$/.test(value.trim())) {
            return "Module name must be kebab-case (e.g. registry-item).";
          }
          return true;
        },
        filter: (value) =>
          String(value)
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-"),
      },
    ],

    actions: [
      // ── Domain ─────────────────────────────────────────────────────────────
      {
        type: "add",
        path: "src/modules/{{moduleName}}/domain/schemas/{{moduleName}}.schema.ts",
        templateFile: "plop-templates/module/domain/schemas/module.schema.ts.hbs",
        skipIfExists: true,
      },

      // ── Application — schemas ──────────────────────────────────────────────
      {
        type: "add",
        path: "src/modules/{{moduleName}}/application/schemas/create-{{moduleName}}.schema.ts",
        templateFile:
          "plop-templates/module/application/schemas/create-module.schema.ts.hbs",
        skipIfExists: true,
      },
      {
        type: "add",
        path: "src/modules/{{moduleName}}/application/schemas/update-{{moduleName}}.schema.ts",
        templateFile:
          "plop-templates/module/application/schemas/update-module.schema.ts.hbs",
        skipIfExists: true,
      },

      // ── Application — service ──────────────────────────────────────────────
      {
        type: "add",
        path: "src/modules/{{moduleName}}/application/services/{{moduleName}}-service.ts",
        templateFile:
          "plop-templates/module/application/services/module-service.ts.hbs",
        skipIfExists: true,
      },

      // ── Application — Server Actions ───────────────────────────────────────
      {
        type: "add",
        path: "src/modules/{{moduleName}}/application/actions/create-{{moduleName}}-action.ts",
        templateFile:
          "plop-templates/module/application/actions/create-module-action.ts.hbs",
        skipIfExists: true,
      },
      {
        type: "add",
        path: "src/modules/{{moduleName}}/application/actions/update-{{moduleName}}-action.ts",
        templateFile:
          "plop-templates/module/application/actions/update-module-action.ts.hbs",
        skipIfExists: true,
      },

      // ── Infrastructure — repository ────────────────────────────────────────
      {
        type: "add",
        path: "src/modules/{{moduleName}}/infrastructure/repositories/{{moduleName}}-repository.ts",
        templateFile:
          "plop-templates/module/infrastructure/repositories/module-repository.ts.hbs",
        skipIfExists: true,
      },

      // ── Presentation — placeholder (forms added via shadcn-zod-form) ───────
      {
        type: "add",
        path: "src/modules/{{moduleName}}/presentation/components/.gitkeep",
        template: "",
        skipIfExists: true,
      },
    ],
  });
}
