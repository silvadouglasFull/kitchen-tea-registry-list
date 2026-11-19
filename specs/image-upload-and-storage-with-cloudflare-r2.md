# SPEC-005: Image Upload and Storage with Cloudflare R2

**Requirement:** RF-05 - Image Upload and Storage

**Status:** Specification

**Date:** 2026-11-19

## 1. Overview

Implement Cloudflare R2 as the application's object storage solution for optional images associated with kitchen tea registries.

The solution must support uploading and storing:

1. Product photos associated with registry items.
2. Couple/organizer profile photos.

Only image references (URLs or storage keys) should be persisted in PostgreSQL. Binary files must remain outside the relational database and application server filesystem.

---

## 2. Objectives

1. Integrate Cloudflare R2 for image storage.
2. Allow organizers to upload optional images for registry items and their profile.
3. Validate uploaded files before accepting them.
4. Store image references in PostgreSQL instead of binary content.
5. Provide a reusable image storage component that can be accessed by different application modules.
6. Keep storage credentials and operations exclusively on the server side.

---

## 3. Scope

### Included

- Cloudflare R2 bucket configuration.
- Server-side integration with Cloudflare R2 using the S3-compatible API.
- Image upload and deletion operations.
- Validation of file type, size, and payload.
- Storage of image references in PostgreSQL.
- Support for product and couple/organizer profile images.
- Handling of image replacement and deletion.
- Environment variable configuration.
- Unit and integration tests for storage operations.

### Excluded from this PoC

- Image resizing, compression, and thumbnail generation.
- Image optimization pipelines.
- CDN customization and advanced caching strategies.
- Multiple image formats or image galleries per registry item.
- Advanced image processing and moderation.

---

## 4. Functional Requirements

### RF-05.1 - Image Upload

The application must allow authenticated organizers to upload optional images associated with registry items and couple/organizer profiles.

### RF-05.2 - File Validation

Before uploading, the application must validate:

- Allowed image formats.
- Maximum file size.
- File MIME type.
- File content signature (magic bytes), when applicable.

The application must not rely exclusively on the file extension or client-provided MIME type.

### RF-05.3 - Image Storage

Uploaded images must be stored in Cloudflare R2.

Each uploaded image must have a unique storage key to prevent filename collisions.

### RF-05.4 - Image Reference Persistence

After a successful upload, the application must persist the resulting image reference in PostgreSQL.

Binary image data must never be stored in PostgreSQL.

### RF-05.5 - Image Replacement

When an organizer replaces an existing image, the application must update the corresponding image reference and remove the previous object from R2 when it is no longer needed.

### RF-05.6 - Image Deletion

When an image is removed from a registry item or profile, its reference must be removed from PostgreSQL and the corresponding object must be deleted from R2.

### RF-05.7 - Authorization

Only authenticated and authorized organizers must be allowed to upload, replace, or delete images associated with their own registries and profiles.

Guest users must not have permission to upload or modify images.

---

## 5. Non-Functional Requirements

1. R2 credentials must never be exposed to the client.
2. Storage operations must execute exclusively on the server side.
3. Uploaded files must be validated before reaching object storage.
4. Storage keys must be unique and organized by resource type.
5. The application must handle upload failures without persisting invalid image references.
6. The implementation must avoid leaving orphaned objects whenever possible.
7. Storage operations must follow the application's modular architecture, keeping business logic separate from infrastructure details.

---

## 6. Architecture Proposal

### 6.1 Libraries

Use the AWS SDK for JavaScript v3 to communicate with Cloudflare R2 through its S3-compatible API.

Install:

```bash
npm install @aws-sdk/client-s3
```

### 6.2 Storage Configuration

Configure the S3 client using Cloudflare R2 credentials and endpoint.

The storage implementation must be centralized and reusable across application modules.

### 6.3 Suggested Structure

```txt
src/
  modules/
    storage/
      domain/
      application/
      infrastructure/
        cloudflare-r2/
          r2-client.ts
          r2-storage-provider.ts
      storage.types.ts
```

The storage module must expose operations for:

- Uploading an image.
- Deleting an image.
- Generating or resolving an image reference.

Business modules must not depend directly on the AWS SDK or Cloudflare R2 implementation.

---

## 7. Cloudflare R2 Configuration

### 7.1 Bucket Setup

Create a dedicated Cloudflare R2 bucket for application images.

Configure the bucket and its access permissions according to the intended image delivery strategy.

### 7.2 Environment Variables

Use environment variables to configure the storage connection.

```env
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_PUBLIC_URL=
```

The `R2_PUBLIC_URL` must represent the base URL used to access publicly available images.

Credentials must only be available to server-side code.

### 7.3 Object Key Strategy

Use predictable resource-based prefixes and unique identifiers.

Examples:

```txt
registries/{registryId}/items/{itemId}/{uuid}.{extension}

organizers/{organizerId}/profile/{uuid}.{extension}
```

Original filenames must not be used directly as storage keys.

---

## 8. Upload and Deletion Flow

### 8.1 Upload Flow

1. The organizer selects an image.
2. The application receives the file through a server-side action.
3. The application validates the file type, size, and content.
4. The application verifies that the organizer has permission to modify the target resource.
5. The storage module uploads the image to Cloudflare R2.
6. The storage module returns the resulting image reference.
7. The corresponding business module persists the image reference in PostgreSQL.
8. The application returns the operation result.

If the database persistence fails after a successful upload, the application should attempt to delete the newly uploaded object to avoid orphaned files.

### 8.2 Deletion Flow

1. The organizer requests image removal.
2. The application verifies ownership and authorization.
3. The corresponding image reference is removed from PostgreSQL.
4. The storage module deletes the object from Cloudflare R2.

If object deletion fails, the application must handle the failure without leaving the database with a reference to an image that has already been removed.

---

## 9. Error Handling

The implementation must handle the following scenarios:

- Invalid image format.
- File exceeding the maximum allowed size.
- Invalid or corrupted image payload.
- Unauthorized upload or deletion attempt.
- Cloudflare R2 connection failure.
- Upload failure.
- Database persistence failure after upload.
- Object deletion failure.

Errors must be logged without exposing credentials or sensitive information.

---

## 10. Testing

### 10.1 Unit Tests

- Image format validation.
- File size validation.
- Image content validation.
- Storage key generation.
- Authorization rules.
- Storage provider error handling.

### 10.2 Integration Tests

- Successful image upload to R2.
- Successful image deletion from R2.
- Database persistence of image references.
- Cleanup when database persistence fails after upload.
- Handling of R2 connection and operation failures.

---

## 11. Acceptance Criteria

1. An authenticated organizer can upload an image for a registry item.
2. An authenticated organizer can upload a profile image.
3. Invalid file types and oversized files are rejected.
4. Uploaded images are stored in Cloudflare R2.
5. Only image references are persisted in PostgreSQL.
6. Image references can be retrieved and used to display images in the application.
7. Organizers cannot modify images belonging to resources they do not own.
8. Replacing or deleting an image triggers the corresponding storage cleanup.
9. R2 credentials are never exposed to the client.
10. Storage operations are reusable and isolated from business modules.

---

## 12. Risks and Mitigations

1. **Risk:** Orphaned objects in R2 after database failures.

   **Mitigation:** Attempt compensating deletion when persistence fails and implement cleanup handling for failed operations.

2. **Risk:** Unauthorized image manipulation.

   **Mitigation:** Validate authentication and resource ownership on every upload, replacement, and deletion operation.

3. **Risk:** Malicious or unwanted file uploads.

   **Mitigation:** Validate file size, MIME type, and actual file content before uploading.

4. **Risk:** Storage credentials exposure.

   **Mitigation:** Keep credentials in server-side environment variables and never return them to the client.

---

## 13. Deliverable

A reusable image storage module integrated with Cloudflare R2, allowing authenticated organizers to upload, replace, and delete optional product and profile images while keeping PostgreSQL responsible only for storing image references.