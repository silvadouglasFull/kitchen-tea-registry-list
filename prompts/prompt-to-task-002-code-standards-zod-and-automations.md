Read the AGENTS.md file and execute exclusively Task 002 (coding standards, pure Zod contracts, and automation using Plop.js and shadcn-zod-form).

Rules and scope:
- Install and configure Zod, Plop (as a dev dependency), and shadcn-zod-form (implementing .tsx forms using React Hook Form, zodResolver, shadcn/ui, and Tailwind CSS).
- Ensure ESLint is configured and passes without any errors or warnings (`npm run lint`).
- Strictly follow naming conventions: kebab-case for files; camelCase for variables, functions, objects, classes, and Zod schemas; and PascalCase for inferred types (`z.infer`) and React components.
- Use pure Zod schemas (separating creation, update, and output/domain schemas where applicable) and Server Actions that validate inputs using `.safeParse()`.
- Do not use `drizzle-zod` for application contracts, custom validation decorators, or `AutoForm`/runtime generation.
- Proceed in small steps, run the linter upon completion, and do not move on to Task 003.