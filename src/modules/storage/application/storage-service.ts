import { r2StorageProvider } from "../infrastructure/cloudflare-r2/r2-storage-provider";
import type {
  OrganizerProfileUploadParams,
  RegistryItemUploadParams,
  UploadResult,
} from "../storage.types";

/**
 * Application-level storage service (SPEC-005).
 *
 * This is the only storage entry-point that domain modules (user-profile,
 * registry-item) should import. It isolates them from the AWS SDK and from
 * the choice of storage backend (Garage locally, R2 in production).
 */
export const storageService = {
  /**
   * Validates and uploads a registry item photo.
   * Throws on validation failure or upload error — the caller is responsible
   * for catching the error and not persisting the imageUrl in that case.
   */
  async uploadRegistryItemPhoto(params: RegistryItemUploadParams): Promise<UploadResult> {
    return r2StorageProvider.uploadRegistryItemPhoto(params);
  },

  /**
   * Validates and uploads an organizer profile photo.
   */
  async uploadOrganizerProfilePhoto(params: OrganizerProfileUploadParams): Promise<UploadResult> {
    return r2StorageProvider.uploadOrganizerProfilePhoto(params);
  },

  /**
   * Deletes a stored object by its S3 object key.
   * Used when a deletion or replacement must clean up the previous file.
   */
  async deleteByKey(objectKey: string): Promise<void> {
    return r2StorageProvider.deleteByKey(objectKey);
  },

  /**
   * Deletes a stored object by its full public URL.
   * Useful when only the URL (not the key) is available from the database row.
   */
  async deleteByPublicUrl(publicUrl: string): Promise<void> {
    return r2StorageProvider.deleteByPublicUrl(publicUrl);
  },
};
