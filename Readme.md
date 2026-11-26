# Kitchen Tea Gift Registry (PoC)

![Next.js](https://img.shields.io/badge/Next.js-App%20Router-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square&logo=typescript)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=flat-square&logo=postgresql)
![Drizzle ORM](https://img.shields.io/badge/Drizzle-ORM-C5F74F?style=flat-square)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat-square&logo=tailwind-css)
![License: MIT](https://img.shields.io/badge/license-MIT-yellow)

## 1. Overview & Purpose

**Kitchen Tea Gift Registry** is a Proof of Concept (PoC) web application designed to streamline the creation and sharing of bridal shower / kitchen tea gift lists.

- **What it does:** Allows event organizers to authenticate via Google, create personalized gift registries, add desired household items (with optional photos, notes, and store links), and share a public, unauthenticated link with their guests.
- **Problem it solves:** Eliminates the hassle of managing fragmented spreadsheets, manual messages, or overly complex e-commerce registries when organizing an intimate kitchen tea event.
- **Target Audience:**
  - **Organizers (Brides, Grooms, & Hosts):** Users who need a fast, low-cost, and intuitive tool to curate and manage their gift list.
  - **Guests:** Friends and family who need frictionless, zero-login access to view the gift list on any device.

---

## 2. Tech Stack

- **Frontend:** Next.js (App Router), React, TypeScript, Tailwind CSS, `shadcn/ui`, React Hook Form.
- **Backend:** Next.js Server Actions, Zod (runtime validation & type inference), Google OAuth 2.0.
- **Database & ORM:** PostgreSQL 16, Drizzle ORM, Drizzle Kit CLI.
- **Object Storage (S3-Compatible):** `@aws-sdk/client-s3` with **Garage** (local Docker emulation) and **Cloudflare R2** (production).
- **Developer Tooling:** Docker & Docker Compose, Plop.js (modular scaffolding), ESLint.

---

## 3. Getting Started (Local Installation & Execution)

### Prerequisites

Make sure you have the following installed on your host machine:
- **Node.js** (v20+ recommended — runs natively on the host)
- **npm** (or compatible package manager)
- **Docker** and **Docker Compose** (used exclusively for PostgreSQL and Garage; Node.js and Nginx are not containerized)
- **Google Cloud Console OAuth 2.0 Credentials** (Client ID and Client Secret)

### Installation Steps

1. **Clone the repository:**
   ```bash
   git clone https://github.com/silvadouglasFull/kitchen-tea-registry-list.git
   cd kitchen-tea-registry-list
   ```

2. **Install Node.js dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   Duplicate the `.env.example` file to `.env` and fill in your local credentials:
   ```bash
   cp .env.example .env
   ```

4. **Start local infrastructure (PostgreSQL & Garage):**
   Ensure `docker/garage/garage.toml` is configured from `docs/templates/garage.template.toml`, then start the containers:
   ```bash
   docker compose up -d
   ```

5. **Run database migrations:**
   Apply the Drizzle ORM schema migrations to your local PostgreSQL instance:
   ```bash
   npx drizzle-kit migrate
   ```

6. **Start the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables (`.env`)

Copy `.env.example` to `.env` and configure the following variables (all sensitive credentials remain strictly server-side):

| Variable | Description | Example / Default |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_APP_URL` | Base URL of the Next.js application | `http://localhost:3000` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://kitchen_tea:kitchen_tea_dev_password@localhost:5432/kitchen_tea_db` |
| `AUTH_SECRET` | Secret key for signing session tokens (`openssl rand -base64 32`) | `your-random-secret` |
| `AUTH_GOOGLE_ID` | Google OAuth 2.0 Client ID | `your-google-client-id.apps.googleusercontent.com` |
| `AUTH_GOOGLE_SECRET` | Google OAuth 2.0 Client Secret | `your-google-client-secret` |
| `STORAGE_ENDPOINT` | S3-compatible endpoint (Garage locally / R2 in prod) | `http://localhost:3900` |
| `STORAGE_REGION` | Storage region identifier | `garage` (or `auto` for R2) |
| `STORAGE_FORCE_PATH_STYLE` | Enables path-style S3 URLs for local Garage | `true` |
| `R2_ACCESS_KEY_ID` | S3/Garage/R2 Access Key ID | `GK...` |
| `R2_SECRET_ACCESS_KEY` | S3/Garage/R2 Secret Access Key | `your-secret-access-key` |
| `R2_BUCKET_NAME` | Target object storage bucket name | `kitchen-tea-local` |
| `R2_PUBLIC_URL` | Base public URL used to serve uploaded images | `http://localhost:3900/kitchen-tea-local` |

---

## 4. Key Features (PoC Scope)

- **Social Authentication:** Frictionless sign-in and logout via Google OAuth 2.0.
- **Organizer Profile Management:** Organizers can view their profile info and upload, replace, or remove their profile photo with automatic storage cleanup.
- **Gift Registry Management:** Create, edit, and soft-delete registries with title, description, optional expiration date, and unique shareable `slug` generation.
- **Registry Item Management:** Add, update, and remove gift items with optional product images, store links, and notes.
- **Public Guest View:** Unauthenticated, read-only public page accessible via shareable link displaying active, non-expired registries and their items.

*(Note: Gift reservations, quantity tracking, RSVP, guestbook messages, and payment/PIX integrations are intentionally out of scope for this PoC.)*

---

## 5. Architecture & Project Structure

The application is built as a **Modular Monolith** using Next.js App Router and Server Actions, enforcing strict separation between domain contracts, application workflows, and persistence/storage infrastructure:

```text
├── adrs/                  # Architectural Decision Records (ADR-001 to ADR-013)
├── specs/                 # Functional & Technical Specifications (SPEC-001 to SPEC-013)
├── tasks/                 # Sequential AI-assisted implementation tasks (001 to 006)
├── docs/templates/        # Configuration & schema templates
├── drizzle/               # Version-controlled SQL migrations
└── src/
    ├── app/               # Next.js App Router pages, layouts, and OAuth routes
    ├── modules/           # Bounded domain modules
    │   ├── authentication/
    │   ├── user-profile/
    │   ├── registry/
    │   ├── registry-item/
    │   └── storage/
    └── shared/
        └── database/      # Drizzle connections & dedicated table schema files
```

### Architectural Highlights
- **Layered Module Design:** Each module separates `domain/` (pure Zod domain schemas), `application/` (input schemas, business services, and `'use server'` actions), `infrastructure/` (Drizzle repositories and S3/R2 storage providers), and `presentation/` (React Hook Form + `shadcn/ui` components).
- **Uniform Server Action Contract:** Every Server Action validates inputs via Zod `.safeParse()`, verifies session and resource ownership (`userId`), and returns a predictable `{ success: boolean, error?: string, data?: T }` envelope.
- **Deterministic Tooling:** Uses `Plop.js` (`npx plop module`) for backend scaffolding and `Drizzle Kit` for schema migrations.

---

## 6. Author & License

### Author
**Douglas Silva**
- **LinkedIn:** [linkedin.com/in/douglas-silvafullstack](https://www.linkedin.com/in/douglas-silvafullstack/)
- **Portfolio:** [dswebdev.com.br](https://dswebdev.com.br/)

### License
This project is licensed under the **MIT License**. See the `LICENSE` file for details.