# ADR-013: Local Development Infrastructure with Docker and Garage

- **Status:** Accepted for PoC
- **Date:** 2026-11-23

## Context
To build and validate the Bridal Shower List PoC efficiently and at low cost, the development environment needs a local relational database (PostgreSQL) and a local S3-compatible object storage emulator to simulate Cloudflare R2 before relying on production or external resources. Previously, MinIO was considered, but licensing changes make Garage a more suitable local S3-compatible option. Additionally, running Node.js and Nginx inside Docker is unnecessary for the local PoC workflow.

## Decision
1. **Docker for Local Infrastructure:** Use Docker to run local infrastructure services needed for development (such as PostgreSQL and Garage), keeping environment setup reproducible across machines.
2. **Garage Instead of MinIO:** Use **Garage** as the local S3-compatible object storage service during development to emulate S3/R2 bucket workflows without relying on MinIO.
3. **No Docker Images for Node or Nginx:** Do **not** use Docker images for **Node.js** or **Nginx** in the local development setup; run Node.js directly on the host machine and avoid introducing Nginx locally.
4. **Server-Side Configuration:** Keep database connection settings, Garage/S3 credentials, and endpoint/public URL configuration isolated in server-side environment variables, never exposed to client code.

## Consequences / Trade-offs
- **Pros:**
  - Reproducible local database and S3-compatible object storage setup without external cloud costs during PoC development.
  - Avoids MinIO licensing friction by standardizing on Garage locally.
  - Simpler, faster local developer loop by running Node.js natively on the host and omitting Nginx locally.
- **Cons / Risks:**
  - Garage requires initial local bucket and key setup/configuration before testing object uploads/deletions.
  - Subtle differences between local Garage behavior and Cloudflare R2 in production (such as URLs or bucket policies) must be verified when integrating R2.