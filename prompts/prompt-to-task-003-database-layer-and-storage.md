Read the AGENTS.md file and execute exclusively Task 003 (database layer using Drizzle ORM + PostgreSQL, and a storage layer compatible with Garage for local development and Cloudflare R2 for production).

Rules and scope:
- Create a dedicated schema file for each table in Drizzle ORM, covering the 5 tables defined in the data model; include support for multiple connections where necessary and manage migrations via the Drizzle Kit CLI.
- Implement the storage layer using an S3-compatible SDK, isolated on the server side—configured for Garage in the local environment and prepared for Cloudflare R2—ensuring that credentials are never exposed to the client.
- Maintain a clear separation of layers (`domain`, `application`, `infrastructure`) and adhere to consistent naming conventions (kebab-case, camelCase, and PascalCase).
- Work in small, incremental steps; validate migrations, database connections, and linting. Do not proceed to Task 004.