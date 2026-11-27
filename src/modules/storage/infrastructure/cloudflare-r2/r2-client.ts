import { S3Client } from "@aws-sdk/client-s3";

/**
 * S3Client factory for Cloudflare R2 / local Garage (SPEC-005 / ADR-005 / ADR-013).
 *
 * Configuration comes entirely from server-side environment variables:
 *   STORAGE_ENDPOINT          — http://localhost:3900 (Garage) or R2 endpoint
 *   STORAGE_REGION            — "garage" (local) or "auto" (R2)
 *   STORAGE_FORCE_PATH_STYLE  — "true" for Garage; omit or "false" for R2
 *   R2_ACCESS_KEY_ID          — access key
 *   R2_SECRET_ACCESS_KEY      — secret key
 *
 * This module must never be imported from client-side code.
 */
function createR2Client(): S3Client {
  const endpoint = process.env.STORAGE_ENDPOINT;
  const region = process.env.STORAGE_REGION ?? "auto";
  const forcePathStyle = process.env.STORAGE_FORCE_PATH_STYLE === "true";
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

  if (!endpoint) throw new Error("STORAGE_ENDPOINT environment variable is not set.");
  if (!accessKeyId) throw new Error("R2_ACCESS_KEY_ID environment variable is not set.");
  if (!secretAccessKey) throw new Error("R2_SECRET_ACCESS_KEY environment variable is not set.");

  return new S3Client({
    endpoint,
    region,
    forcePathStyle,
    credentials: { accessKeyId, secretAccessKey },
  });
}

/** Singleton S3Client instance — created lazily on first import. */
export const r2Client = createR2Client();
