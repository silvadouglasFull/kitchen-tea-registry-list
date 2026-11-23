# ADR-007: Drizzle ORM for Database Access and Migrations

- **Status:** Accepted for PoC
- **Date:** 2026-11-19

## Context

The Bridal Shower List application requires a consistent and maintainable way to interact with PostgreSQL, define database schemas, manage migrations, and maintain type safety across the application.

The selected ORM should provide reliable PostgreSQL support, native TypeScript integration, good documentation, and a development workflow familiar to the team.

The project must also support configuring multiple database connections, allowing different databases to be accessed and managed independently when required.

## Decision

Adopt **Drizzle ORM** as the standard ORM for database access and schema management.

The decision is based on the following characteristics:

- Well-documented library with an established development workflow.
- Native TypeScript support and strong type inference.
- Excellent compatibility with PostgreSQL.
- Familiarity and practical experience of the development team with the library.
- Lightweight implementation aligned with the PoC's simplicity and low-cost objectives.

The following conventions must be adopted:

1. **Table schemas:** Each database table must have its own dedicated file containing only that table's schema definition and its specific inferred TypeScript types.
2. **Type inference:** Use Drizzle's native type inference to derive select and insert types from table definitions.
3. **Migrations:** All database migrations must be managed through Drizzle Kit CLI.
4. **Migration workflow:** Generate SQL migration files from schema changes and apply them using the ORM's migration tooling.
5. **Multiple connections:** The application and migration configuration must support multiple independent database connections, with separate configurations where necessary.
6. **Database access:** Repositories must use Drizzle ORM to perform database operations, keeping persistence responsibilities separated from business logic.

## Consequences / Trade-offs

### Pros

- Native TypeScript support reduces duplicated type definitions.
- PostgreSQL integration provides a consistent relational persistence solution.
- Well-documented tooling simplifies implementation and maintenance.
- Team familiarity accelerates development and reduces onboarding effort.
- Dedicated table schema files improve organization and maintainability.
- CLI-managed migrations provide a versioned and reproducible database evolution process.
- Multiple database configurations provide flexibility for future requirements.

### Cons / Risks

- Schema definitions and inferred types must remain aligned with domain requirements.
- Developers must follow the migration workflow consistently.
- Multiple database connections require careful configuration and credential management.
- Incorrect schema changes or migrations may affect existing data.
- The project becomes dependent on Drizzle ORM and Drizzle Kit conventions.

## References

- https://orm.drizzle.team/docs/overview
- https://orm.drizzle.team/docs/sql-schema-declaration
- https://orm.drizzle.team/docs/migrations