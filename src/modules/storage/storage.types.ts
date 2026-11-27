/**
 * Shared types and object-key strategy for the storage module (SPEC-005).
 *
 * Object key patterns:
 *   Registry item photo:   registries/{registryId}/items/{itemId}/{uuid}.{ext}
 *   Organizer profile:     organizers/{organizerId}/profile/{uuid}.{ext}
 *
 * These patterns are intentional — original filenames are never used as keys.
 */

/** Allowed MIME types for uploaded images. */
export const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const;
export type AllowedMimeType = (typeof ALLOWED_MIME_TYPES)[number];

/** Maximum upload size: 5 MB expressed in bytes. */
export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

/**
 * Magic-byte signatures used to verify the actual content of a file,
 * independent of the client-provided MIME type or file extension.
 */
export const MAGIC_BYTES: Record<AllowedMimeType, number[][]> = {
  "image/jpeg": [[0xff, 0xd8, 0xff]],
  "image/png": [[0x89, 0x50, 0x4e, 0x47]],
  "image/webp": [[0x52, 0x49, 0x46, 0x46]], // RIFF header; content check includes offset 8-11
  "image/gif": [[0x47, 0x49, 0x46, 0x38, 0x39], [0x47, 0x49, 0x46, 0x38, 0x37]], // GIF89 / GIF87
};

/** Result returned after a successful upload. */
export interface UploadResult {
  /** The S3 object key (path inside the bucket). */
  objectKey: string;
  /** Full public URL ready for use in an <img> src or database column. */
  publicUrl: string;
}

/** Parameters for uploading a registry item photo. */
export interface RegistryItemUploadParams {
  registryId: string;
  itemId: string;
  fileBuffer: Buffer;
  mimeType: AllowedMimeType;
  fileExtension: string;
}

/** Parameters for uploading an organizer profile photo. */
export interface OrganizerProfileUploadParams {
  organizerId: string;
  fileBuffer: Buffer;
  mimeType: AllowedMimeType;
  fileExtension: string;
}

/**
 * Builds the S3 object key for a registry item photo.
 * Uses a UUID segment to prevent collisions on re-uploads.
 */
export function buildRegistryItemKey(
  registryId: string,
  itemId: string,
  uuid: string,
  extension: string,
): string {
  return `registries/${registryId}/items/${itemId}/${uuid}.${extension}`;
}

/**
 * Builds the S3 object key for an organizer profile photo.
 */
export function buildOrganizerProfileKey(
  organizerId: string,
  uuid: string,
  extension: string,
): string {
  return `organizers/${organizerId}/profile/${uuid}.${extension}`;
}
