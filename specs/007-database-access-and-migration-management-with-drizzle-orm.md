# SPEC-007: Database Access and Migration Management with Drizzle ORM

## 1. Overview

This specification defines how the Bridal Shower List application will interact with PostgreSQL using Drizzle ORM.

Drizzle ORM will be responsible for database queries, table schema definitions, and TypeScript type inference. Drizzle Kit will manage database migrations through its CLI tools.

The implementation must support multiple independent database connections while maintaining clear separation between database access, business logic, and application services.

## 2. Objectives

- Standardize PostgreSQL access using Drizzle ORM.
- Use native TypeScript type inference from database schemas.
- Keep each table definition in its own dedicated file.
- Manage database schema changes through Drizzle Kit CLI.
- Maintain version-controlled and reproducible migrations.
- Support multiple database connections and independent configurations.
- Keep database access isolated within the persistence layer.

## 3. Scope

### 3.1. In Scope

- Install and configure Drizzle ORM and Drizzle Kit.
- Configure PostgreSQL as the database dialect.
- Define each database table in a dedicated schema file.
- Infer insert and select types from table definitions.
- Implement database connection configuration.
- Support multiple database connections.
- Generate SQL migrations through Drizzle Kit.
- Apply migrations through Drizzle Kit CLI.
- Organize repositories to use Drizzle ORM for persistence operations.
- Keep migration files and schema definitions version-controlled.

### 3.2. Out of Scope

- Replacing PostgreSQL with another database.
- Implementing a custom migration management system.
- Managing migrations through manual database modifications as the standard workflow.
- Introducing another ORM or query builder.
- Implementing database replication or distributed database infrastructure.
- Building a generic database abstraction framework beyond the application's actual requirements.

## 4. Technology Requirements

### 4.1. Drizzle ORM

**Library:** `drizzle-orm`

Drizzle ORM must be used for database operations and table schema definitions.

Installation:

```bash
npm install drizzle-orm
```

### 4.2. Drizzle Kit

**Library:** `drizzle-kit`

Drizzle Kit must be installed as a development dependency and used to manage database migrations.

Installation:

```bash
npm install -D drizzle-kit
```

### 4.3. PostgreSQL

PostgreSQL must remain the database dialect used by the application.

The PostgreSQL driver must be selected according to the application's runtime and hosting requirements. The selected driver must be compatible with Drizzle ORM.

## 5. Database Schema Organization

### 5.1. Dedicated File per Table

Each database table must have its own dedicated schema file.

A table schema file must contain only:

- The table definition.
- The table-specific inferred insert type.
- The table-specific inferred select type.
- Other type definitions that are exclusively related to that table.

Table definitions must not be grouped into a single large schema file.

Example structure:

```text
src/
└── shared/
    └── database/
        ├── schema/
        │   ├── users.ts
        │   ├── registries.ts
        │   └── registry-items.ts
        ├── connections/
        └── index.ts
```

### 5.2. Table Definition and Type Inference

Each table must use Drizzle's PostgreSQL schema API.

TypeScript types must be inferred directly from the table definition using `$inferSelect` and `$inferInsert`.

Example:

```typescript
import { pgTable, text, uuid } from 'drizzle-orm/pg-core';

/**
 * Defines the users database table.
 */
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
});

/**
 * Represents a user record retrieved from the database.
 */
export type User = typeof users.$inferSelect;

/**
 * Represents the data required to insert a user record.
 */
export type NewUser = typeof users.$inferInsert;
```

The inferred types must be reused by repositories and other persistence-related components instead of manually duplicating database record definitions.

### 5.3. Schema Discovery

Drizzle Kit must be configured to discover all table schema files.

The configuration must point to the schema directory or an appropriate glob pattern so that new table definitions are automatically included in migration generation.

Example:

```typescript
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/shared/database/schema',
  out: './drizzle',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

### 5.4. Relationships and Shared Definitions

Table-specific definitions must remain in their respective files.

If relationships, shared enums, or other cross-table definitions are required, they must be organized separately without turning individual table files into shared schema containers.

## 6. Database Connection Management

### 6.1. Connection Configuration

Database connections must be configured independently from repositories and business services.

Connection credentials must be provided through environment variables or the project's secure configuration mechanism.

Sensitive credentials must never be hardcoded or exposed to client-side code.

### 6.2. Multiple Database Connections

The architecture must support configuring and using more than one PostgreSQL connection.

Each connection must have:

- A unique identifier.
- Its own connection configuration.
- Its own credentials.
- An explicitly defined purpose.
- A corresponding Drizzle database instance.

Repositories must use the appropriate database instance according to their responsibilities.

Example conceptual structure:

```text
src/
└── shared/
    └── database/
        ├── schema/
        ├── connections/
        │   ├── primary.ts
        │   └── secondary.ts
        └── index.ts
```

The implementation must avoid coupling repositories directly to a single global database connection.

### 6.3. Independent Migration Configurations

Each database requiring independent schema management must have its own Drizzle Kit configuration.

Each configuration must define:

- PostgreSQL dialect.
- Schema file location.
- Migration output directory.
- Database connection credentials.

Example:

```text
drizzle-primary.config.ts
drizzle-secondary.config.ts
```

Each database must have an independent migration output directory to prevent migration histories from being mixed.

Drizzle Kit must allow selecting the appropriate configuration through its CLI `--config` option.

## 7. Migration Management

### 7.1. Migration Strategy

All database migrations must be managed through Drizzle Kit CLI.

The project must follow a schema-first, code-first migration workflow:

1. Modify the corresponding Drizzle table schema.
2. Generate a migration using Drizzle Kit.
3. Review the generated SQL.
4. Commit the migration files to version control.
5. Apply the migration using Drizzle Kit.

Directly modifying the database without a corresponding migration must not be the standard schema evolution workflow.

### 7.2. Generate Migrations

Use the following command to generate migrations:

```bash
npx drizzle-kit generate
```

A descriptive migration name should be provided whenever possible:

```bash
npx drizzle-kit generate --name=create-users-table
```

### 7.3. Apply Migrations

Use the following command to apply pending migrations:

```bash
npx drizzle-kit migrate
```

Drizzle Kit must track successfully applied migrations in its migration log table.

### 7.4. Multiple Database Migrations

When multiple databases are configured, migrations must be generated and applied using the corresponding configuration.

Example:

```bash
# Generate migrations
npx drizzle-kit generate --config=drizzle-primary.config.ts
npx drizzle-kit generate --config=drizzle-secondary.config.ts

# Apply migrations
npx drizzle-kit migrate --config=drizzle-primary.config.ts
npx drizzle-kit migrate --config=drizzle-secondary.config.ts
```

Each configuration must point to its corresponding database and migration directory.

### 7.5. Migration Versioning

Migration files must be committed to version control.

The team must not modify migrations that have already been applied to shared or production environments. Corrections must be introduced through new migrations.

Generated SQL must be reviewed before being applied to important environments.

## 8. Repository Integration

Repositories must use Drizzle ORM to perform database operations.

The repository layer must be responsible for:

- Query execution.
- Data insertion.
- Data updates.
- Data deletion.
- Data retrieval.
- Mapping persistence results to the expected application contracts when necessary.

Business rules must remain in application services rather than being embedded in database connection configuration or repository infrastructure.

Repositories must receive their database dependencies explicitly, allowing different repositories to use different configured connections when necessary.

## 9. Non-Functional Requirements

### NFR-007.1. Type Safety

Database record types must be inferred from Drizzle table definitions wherever applicable.

### NFR-007.2. Maintainability

Each table must have an isolated schema file, making database definitions easier to locate and maintain.

### NFR-007.3. Migration Traceability

All schema changes must be represented by version-controlled migration files.

### NFR-007.4. Configuration Flexibility

The application must support multiple independently configured database connections.

### NFR-007.5. Security

Database credentials must remain server-side and must not be exposed to the browser or committed to version control.

### NFR-007.6. Architectural Separation

Database access must remain isolated from business logic through the repository layer.

## 10. Testing Requirements

The implementation must include tests covering:

- Successful database connection initialization.
- Successful execution of database queries.
- Correct insert and select type inference.
- Correct persistence behavior through repositories.
- Successful migration generation.
- Successful migration execution.
- Migration compatibility with the current database schema.
- Independent initialization of multiple database connections.
- Correct database selection by repositories configured for different connections.
- Database credentials remaining inaccessible to client-side code.

## 11. Acceptance Criteria

- [ ] Drizzle ORM is installed and configured.
- [ ] Drizzle Kit is installed as a development dependency.
- [ ] PostgreSQL is configured as the database dialect.
- [ ] Each database table has its own dedicated schema file.
- [ ] Each table file contains only its table definition and table-specific inferred types.
- [ ] Insert and select types are inferred using Drizzle's native TypeScript capabilities.
- [ ] Drizzle Kit automatically discovers table schema files.
- [ ] Migrations can be generated through the CLI.
- [ ] Migrations can be applied through the CLI.
- [ ] Migration files are version-controlled.
- [ ] Multiple database connections can be configured independently.
- [ ] Each independently managed database can have its own Drizzle Kit configuration and migration directory.
- [ ] Repositories use Drizzle ORM for database operations.
- [ ] Database credentials are not exposed to client-side code.
- [ ] Database access remains separated from business logic.

## 12. Risks and Mitigations

| Risk | Mitigation |
|---|---|
| Table definitions become inconsistent with application contracts. | Use inferred types and review affected contracts when schemas change. |
| Migration history becomes inconsistent across environments. | Generate, review, version, and apply migrations through Drizzle Kit. |
| Incorrect migrations affect existing data. | Review generated SQL before applying migrations to important environments. |
| Multiple connections are incorrectly configured. | Maintain independent configurations, credentials, and migration directories. |
| Repositories become coupled to a global connection. | Inject the required database instance explicitly. |
| Credentials are exposed accidentally. | Keep connection configuration server-side and use environment variables. |

## 13. Expected Deliverable

A functional database infrastructure based on Drizzle ORM and PostgreSQL, including:

- Dedicated schema files for each database table.
- Native TypeScript type inference.
- Configured database connections.
- Support for multiple independent database configurations.
- Drizzle Kit CLI migration workflow.
- Repository integration for database operations.

The implementation must provide a maintainable and type-safe persistence foundation aligned with the application's modular monolith architecture.