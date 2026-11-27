import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";
import {
  ALLOWED_MIME_TYPES,
  buildOrganizerProfileKey,
  buildRegistryItemKey,
  MAGIC_BYTES,
  MAX_FILE_SIZE_BYTES,
  type AllowedMimeType,
  type OrganizerProfileUploadParams,
  type RegistryItemUploadParams,
  type UploadResult,
} from "../../storage.types";
import { r2Client } from "./r2-client";

// ── Helpers ──────────────────────────────────────────────────────────────────

function getBucket(): string {
  const bucket = process.env.R2_BUCKET_NAME;
  if (!bucket) throw new Error("R2_BUCKET_NAME environment variable is not set.");
  return bucket;
}

function getPublicUrlBase(): string {
  const base = process.env.R2_PUBLIC_URL;
  if (!base) throw new Error("R2_PUBLIC_URL environment variable is not set.");
  return base.replace(/\/$/, ""); // strip trailing slash
}

// ── Validation ───────────────────────────────────────────────────────────────

/**
 * Validates file size, MIME type, and magic bytes before upload (SPEC-005 RF-05.2).
 * Throws a descriptive error on the first failed check.
 */
function validateFile(buffer: Buffer, mimeType: string): asserts mimeType is AllowedMimeType {
  if (buffer.byteLength === 0) {
    throw new Error("Uploaded file is empty.");
  }
  if (buffer.byteLength > MAX_FILE_SIZE_BYTES) {
    throw new Error(
      `File exceeds the maximum allowed size of ${MAX_FILE_SIZE_BYTES / (1024 * 1024)} MB.`,
    );
  }

  const isAllowedMime = (ALLOWED_MIME_TYPES as readonly string[]).includes(mimeType);
  if (!isAllowedMime) {
    throw new Error(
      `File type "${mimeType}" is not allowed. Allowed types: ${ALLOWED_MIME_TYPES.join(", ")}.`,
    );
  }

  const allowedMime = mimeType as AllowedMimeType;
  const signatures = MAGIC_BYTES[allowedMime];
  const matchesMagic = signatures.some((sig) =>
    sig.every((byte, index) => buffer[index] === byte),
  );

  if (!matchesMagic) {
    throw new Error(
      `File content does not match the declared MIME type "${mimeType}". Upload rejected.`,
    );
  }
}

// ── Upload ───────────────────────────────────────────────────────────────────

async function upload(objectKey: string, buffer: Buffer, mimeType: string): Promise<UploadResult> {
  const bucket = getBucket();
  const publicUrlBase = getPublicUrlBase();

  await r2Client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: objectKey,
      Body: buffer,
      ContentType: mimeType,
      ContentLength: buffer.byteLength,
    }),
  );

  return {
    objectKey,
    publicUrl: `${publicUrlBase}/${objectKey}`,
  };
}

// ── Delete ───────────────────────────────────────────────────────────────────

/**
 * Deletes an object by its storage key.
 */
async function deleteByKey(objectKey: string): Promise<void> {
  const bucket = getBucket();
  await r2Client.send(new DeleteObjectCommand({ Bucket: bucket, Key: objectKey }));
}

/**
 * Derives the object key from a full public URL and deletes it.
 * Useful when only the publicUrl is stored and the key must be reconstructed.
 */
async function deleteByPublicUrl(publicUrl: string): Promise<void> {
  const base = getPublicUrlBase();
  if (!publicUrl.startsWith(base)) {
    throw new Error(
      `Public URL "${publicUrl}" does not match the configured R2_PUBLIC_URL base.`,
    );
  }
  const objectKey = publicUrl.slice(base.length + 1); // +1 for the separating "/"
  await deleteByKey(objectKey);
}

// ── Public provider interface ─────────────────────────────────────────────────

/**
 * Storage provider for Cloudflare R2 / local Garage (SPEC-005).
 *
 * Business modules (user-profile, registry-item) depend on this provider
 * interface — they never import @aws-sdk/client-s3 directly.
 */
export const r2StorageProvider = {
  /**
   * Validates and uploads a registry item photo.
   * Returns the object key and full public URL on success.
   */
  async uploadRegistryItemPhoto(params: RegistryItemUploadParams): Promise<UploadResult> {
    validateFile(params.fileBuffer, params.mimeType);
    const objectKey = buildRegistryItemKey(
      params.registryId,
      params.itemId,
      randomUUID(),
      params.fileExtension,
    );
    return upload(objectKey, params.fileBuffer, params.mimeType);
  },

  /**
   * Validates and uploads an organizer profile photo.
   * Returns the object key and full public URL on success.
   */
  async uploadOrganizerProfilePhoto(params: OrganizerProfileUploadParams): Promise<UploadResult> {
    validateFile(params.fileBuffer, params.mimeType);
    const objectKey = buildOrganizerProfileKey(
      params.organizerId,
      randomUUID(),
      params.fileExtension,
    );
    return upload(objectKey, params.fileBuffer, params.mimeType);
  },

  /** Deletes a stored object by its S3 object key. */
  deleteByKey,

  /** Deletes a stored object by its full public URL. */
  deleteByPublicUrl,
};
