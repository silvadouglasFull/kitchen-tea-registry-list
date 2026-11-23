# Task 001: Local Infrastructure Setup & Verification

## 1. Objective
Initialize and verify the local development infrastructure for the Bridal Shower List PoC, including Dockerized PostgreSQL and Garage (S3-compatible storage), native Next.js project bootstrap, core dependencies, and server-side environment configuration.

## 2. References
- `AGENTS.md`
- `adrs/003-stack-and-postgresql-database-selection.md`
- `adrs/005-image-upload-strategy-with-cloudflare-r2.md`
- `adrs/007-drizzle-orm-for-database-access-and-migrations.md`
- `adrs/013-local-development-infrastructure-with-docker-and-garage.md` (ADR-013)
- `specs/003-application-stack-and-postgresql-database.md`
- `specs/004-google-social-authentication.md`
- `specs/005-image-upload-and-storage-with-cloudflare-r2.md`
- `specs/013-local-development-infrastructure.md` (SPEC-013)
- Templates in `docs/templates/`:
  - `docs/templates/env.template`
  - `docs/templates/docker-compose.template.yml`
  - `docs/templates/garage.template.toml`

## 3. Architectural Constraints (Mandatory)
- **Docker Services Only:** Run only **PostgreSQL** and **Garage** inside Docker.
- **No Node or Nginx Containers:** Do **NOT** create a `Dockerfile` or Docker services for Node.js or Nginx (`ADR-013`). Run Next.js natively on the host machine.
- **No MinIO:** Use **Garage** (`dxflrs/garage`) to emulate S3/Cloudflare R2 locally.
- **Secret Isolation:** Ensure `.env` is ignored in `.gitignore` and never expose database, OAuth, or Garage/R2 credentials to client components.

## 4. Execution Steps
1. **Create Local Infrastructure Configuration Files:**
   - Copy/adapt `docs/templates/docker-compose.template.yml` to `docker-compose.yml` at the project root.
   - Copy/adapt `docs/templates/garage.template.toml` to `docker/garage/garage.toml` (generate unique `rpc_secret` and `admin_token` values locally; ensure `docker/garage/garage.toml` is ignored or uses local-only secrets).
   - Copy `docs/templates/env.template` to `.env.example` (committed) and `.env` (git-ignored) with valid local development credentials.
2. **Start and Verify Docker Infrastructure:**
   - Run `docker compose up -d`.
   - Verify PostgreSQL is healthy and accepting connections (`docker compose exec postgres pg_isready -U postgres`).
   - Verify Garage single-node status (`docker compose exec garage /garage status`) and confirm the default bucket and access key are created.
3. **Initialize Next.js & Core Dependencies (Native Host):**
   - Initialize Next.js (App Router, TypeScript, Tailwind CSS, ESLint, `src/` directory) if not already initialized.
   - Install core PoC runtime and dev dependencies:
     - Database: `drizzle-orm`, `pg` (or `postgres`), `drizzle-kit`, `@types/pg`
     - Storage (S3/R2): `@aws-sdk/client-s3`
     - Validation & Forms: `zod`, `react-hook-form`, `@hookform/resolvers`
     - Auth: `next-auth` (or `@auth/core` / `@auth/google-provider` per `SPEC-004`)
     - Scaffolding: `plop` (devDependency)
4. **Smoke-Test Connectivity:**
   - Run `npm run lint` and `npm run build` to verify the Next.js baseline compiles cleanly.
   - Run a lightweight verification script or test confirming:
     1. PostgreSQL accepts a connection using `DATABASE_URL` from `.env`.
     2. `@aws-sdk/client-s3` can list/put/delete a test object against the local Garage endpoint (`http://localhost:3900`).

## 5. Acceptance Criteria
- [ ] `docker-compose.yml` starts PostgreSQL and Garage without using MinIO, Node.js, or Nginx containers.
- [ ] No `Dockerfile` exists for Node.js or Nginx.
- [ ] `.env.example` and `.env` are configured, with `.env` listed in `.gitignore`.
- [ ] PostgreSQL is reachable from the host via `DATABASE_URL`.
- [ ] Garage is running in `--single-node --default-bucket` mode and reachable via S3 API (`http://localhost:3900`).
- [ ] Next.js runs natively on the host (`npm run dev` / `npm run build`) and passes `npm run lint`.