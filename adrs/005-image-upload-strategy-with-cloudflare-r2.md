# ADR-005: Image Upload Strategy with Cloudflare R2

- **Status:** Accepted for PoC
- **Date:** 2026-11-19

## Context
Product photos on items and couple/organizer profile photos are optional in the PoC, and storing binary files directly inside the relational database or local server filesystem is undesirable for cost, scalability, and portability.

## Decision
Store optional uploaded images in **Cloudflare R2** object storage and persist only the resulting image URL/reference in PostgreSQL, validating image metadata/payloads before accepting them.

## Consequences / Trade-offs
- **Pros:**
  - Low-cost object storage suited to optional media assets.
  - Keeps database rows lightweight and separates media storage from application code.
- **Cons / Risks:**
  - Requires bucket configuration, credentials management, and validation of file types, sizes, and URLs to avoid broken or unwanted uploads.
  - Orphaned files in R2 may occur if an item or image is replaced/deleted without cleanup logic.