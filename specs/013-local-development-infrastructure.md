# SPEC-013: Local Development Infrastructure

- **Requirement:** RF-09 - Local Development Infrastructure Setup
- **Status:** Specification
- **Date:** 2026-11-23

## 1. Overview
This specification defines the local development infrastructure baseline for the Bridal Shower List PoC using Docker for infrastructure services, Garage for local S3/R2-compatible object storage, and native host execution for Node.js (without Node or Nginx Docker containers).

## 2. Scope and Environment Rules
- **Dockerized Infrastructure:** Use Docker to run local infrastructure services required for development, including **PostgreSQL** and **Garage**.
- **Object Storage Emulator:** Use **Garage** instead of MinIO to provide local S3-compatible object storage simulating Cloudflare R2 during development.
- **Excluded Container Images:** Do **not** create or use Docker images for **Node.js** or **Nginx** in the local development environment.
- **Environment Variables:** Configure PostgreSQL and Garage/S3 connection parameters via environment variables on the server side; keep secrets and storage credentials out of version control and out of client-side code.

## 3. Out of Scope for this Spec
- Production hosting, cloud deployment pipelines, or high-availability/clustering setups.
- Dockerized Node.js runtime or Nginx reverse-proxy setup for local development.
- Application feature logic, schemas, or UI screens (covered in their respective specs).

## 4. Acceptance Criteria
- [ ] Local PostgreSQL and Garage run via Docker for development.
- [ ] MinIO is not used; Garage serves as the local S3-compatible storage target.
- [ ] No Docker image is used for Node.js or Nginx in the local setup.
- [ ] Environment variables for database and Garage/S3 access are documented and kept out of source control and client bundles.