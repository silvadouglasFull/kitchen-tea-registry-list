Read the AGENTS.md file and execute Task 005 exclusively (covering the `Gift Registry` and `Registry Items` domain modules, along with integration with a storage solution for item photos).

Rules and scope:
- Structure the `Gift Registry` and `Registry Items` modules using a `domain`, `application`, and `infrastructure` architecture (repositories using Drizzle ORM without business logic; services containing business logic; and Server Actions utilizing `.safeParse()` and returning a `{ success, error?, data? }` object).
- Implement the generation of unique `slugs`, validation using standard Zod, session and ownership verification (`resource.userId === session.userId`), *soft deletes*, and appropriate data projections for both organizers and guests.
- Integrate the uploading, replacing, and removing of optional item photos with the storage module (using local Garage or Cloudflare R2), ensuring that orphaned or outdated objects are cleaned up.
- Work in small, incremental steps, run the linter, and do not proceed to Task 006.