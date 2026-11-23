# SPEC-001: Project Architecture and Modular Structure for the PoC

**Requirement:** NFR-001 - Application Architecture and Modular Structure

**Status:** Specification

**Date:** 2026-11-19

## 1. Overview

Define the application's technical architecture and modular structure for the Kitchen Tea Gift Registry PoC.

The project will use a modular monolithic architecture based on Next.js and PostgreSQL, prioritizing simplicity, low hosting costs, maintainability, and clear separation of responsibilities.

The application must be organized into independent business modules with well-defined boundaries, avoiding unnecessary coupling and preparing the codebase for potential future expansion.

---

## 2. Objectives

1. Establish Next.js as the main application framework.
2. Use PostgreSQL as the primary relational database.
3. Implement a modular architecture with clearly defined business boundaries.
4. Separate business logic from data persistence.
5. Keep database access and business operations on the server side whenever possible.
6. Use Next.js Server Actions as the primary entry point for client-initiated business operations.
7. Minimize infrastructure complexity and hosting costs during the PoC.
8. Establish an architecture that allows future extraction of modules into independent services if necessary.

---

## 3. Scope

### Included

- Next.js application setup.
- PostgreSQL database integration.
- Modular monolithic architecture.
- Separation of business logic and data persistence.
- Server-side execution of services and repositories.
- Server Actions for client-initiated operations.
- Explicit dependency management between modules.
- API Routes for operations that require HTTP endpoints.
- Automated API documentation using OpenAI for the few endpoints that exist.

### Excluded from this PoC

- Independent microservices.
- Inter-service communication through HTTP or messaging brokers.
- Distributed infrastructure and orchestration.
- Independent deployment and scaling of business modules.
- Complex distributed transaction management.

---

## 4. Architectural Principles

### 4.1 Modular Monolith

The application must be deployed as a single application while maintaining logical separation between business modules.

Each module must have a clearly defined responsibility and expose only the operations necessary for other modules to interact with it.

### 4.2 Separation of Responsibilities

The architecture must separate the following responsibilities:

- **Actions:** Handle client-initiated operations, validate input, coordinate application services, and return results.
- **Services:** Contain business rules and coordinate domain operations.
- **Repositories:** Handle database access and persistence operations.
- **Domain:** Define business entities, types, and domain-specific rules where applicable.

### 4.3 Low Coupling

Modules must avoid direct dependencies on the internal implementation details of other modules.

Communication between modules should occur through explicitly exposed interfaces or application services.

### 4.4 Server-Side Execution

Services and repositories must execute exclusively on the server side.

Client components must not access repositories or database connections directly.

### 4.5 Explicit Dependencies

Dependencies must be explicit and centralized where appropriate, avoiding hidden dependencies and unnecessary global coupling.

---

## 5. Proposed Project Structure

The project should follow a modular structure organized around business capabilities.

Suggested structure:

```txt
src/
  app/
    actions/
    api/
    (routes)/

  modules/
    authentication/
      domain/
      application/
      infrastructure/

    registry/
      domain/
      application/
      infrastructure/

    items/
      domain/
      application/
      infrastructure/

    storage/
      domain/
      application/
      infrastructure/

  shared/
    database/
    types/
    utils/

  lib/
```

The structure is a starting point and may evolve as the actual business requirements become clearer.

### 5.1 Module Responsibilities

Each module must encapsulate its own business logic and persistence responsibilities.

Suggested modules:

- **Authentication:** Organizer authentication and session management.
- **Registry:** Registry creation, retrieval, and management.
- **Items:** Product creation, editing, removal, and retrieval.
- **Storage:** Image upload and deletion through Cloudflare R2.

Shared components must contain only genuinely reusable functionality and must not become a repository for unrelated business logic.

---

## 6. Server Actions and API Routes

### 6.1 Server Actions

Server Actions must be the primary mechanism for client-initiated business operations.

Requirements:

- Validate incoming data on the server.
- Verify authentication and authorization when required.
- Delegate business operations to application services.
- Avoid embedding business rules directly in actions.
- Return structured results.
- Never expose database credentials or infrastructure details to the client.

### 6.2 API Routes

API Routes should only be created when an operation requires an HTTP endpoint.

They must delegate business operations to the appropriate application services instead of implementing business rules directly.

### 6.3 API Documentation

For the few API endpoints required by the PoC, use OpenAI to support automated API documentation generation.

---

## 7. Database Architecture

### 7.1 PostgreSQL

PostgreSQL will be the application's primary relational database.

All persistent business data must be managed through the database layer.

### 7.2 Repository Pattern

Database operations must be encapsulated in repositories.

Services must not depend directly on database-specific implementation details.

### 7.3 Persistence Isolation

Business modules must access persistence through their respective repositories or explicitly exposed module interfaces.

This approach must allow persistence implementations to evolve without requiring changes throughout the business logic.

---

## 8. Dependency Management

1. Business modules must avoid circular dependencies.
2. Dependencies between modules must be explicit.
3. Shared functionality must not contain module-specific business rules.
4. Services must depend on abstractions where appropriate.
5. Repositories must remain isolated from client-side code.
6. Infrastructure-specific implementations must not leak into unrelated business modules.

---

## 9. Non-Functional Requirements

1. The application must be deployable as a single Next.js application.
2. The architecture must prioritize low operational complexity.
3. Business logic must remain independent of database implementation details.
4. Database access must remain server-side.
5. Modules must have clearly defined responsibilities.
6. Changes within one module should have minimal impact on unrelated modules.
7. The architecture must support future extraction of modules into independent services without requiring a complete application rewrite.

---

## 10. Testing

### 10.1 Unit Tests

- Test business rules independently of database implementations.
- Test application services using mocked repository dependencies.
- Verify module-specific behavior.

### 10.2 Integration Tests

- Verify repository operations against PostgreSQL.
- Verify service and repository integration.
- Verify interactions between modules through their exposed interfaces.

### 10.3 Functional Tests

- Verify client-initiated operations through Server Actions.
- Verify authentication and authorization boundaries.
- Verify API Routes when implemented.

---

## 11. Acceptance Criteria

1. The application runs as a single Next.js application.
2. PostgreSQL is configured as the primary relational database.
3. Business modules have clearly defined responsibilities.
4. Business logic is separated from data persistence.
5. Services and repositories execute exclusively on the server side.
6. Client-initiated business operations use Server Actions whenever applicable.
7. Actions delegate business operations to application services.
8. Modules do not depend directly on the internal implementations of unrelated modules.
9. No unnecessary independent microservices are introduced.
10. The project structure supports future architectural evolution.

---

## 12. Risks and Mitigations

1. **Risk:** Business responsibilities become mixed across actions, services, and repositories.

   **Mitigation:** Maintain clear architectural boundaries and ensure each layer has a well-defined responsibility.

2. **Risk:** Excessive coupling between business modules.

   **Mitigation:** Use explicit module interfaces and avoid accessing internal implementations of other modules.

3. **Risk:** Shared code becomes a source of unnecessary dependencies.

   **Mitigation:** Keep shared functionality limited to genuinely reusable components.

4. **Risk:** Future requirements demand independent scaling of specific modules.

   **Mitigation:** Maintain module boundaries that facilitate future extraction into independent services.

---

## 13. Deliverable

A modular monolithic Next.js application integrated with PostgreSQL, organized into independent business modules with clear boundaries, separation of business logic and persistence, and server-side execution through Server Actions.

The resulting architecture must provide a simple and cost-effective foundation for validating the Kitchen Tea Gift Registry PoC while preserving the possibility of future architectural evolution.