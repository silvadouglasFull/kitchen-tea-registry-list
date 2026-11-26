import { z } from "zod";

/**
 * Input schema for updating a Registry.
 * Only include fields that are explicitly allowed to be modified.
 * Excludes persistence-managed fields: id, createdAt, updatedAt, deletedAt.
 */
export const updateRegistrySchema = z.object({
  // TODO: define updatable fields (usually optional variants of creation fields)
  // example: name: z.string().trim().min(1).max(255).optional(),
});

export type UpdateRegistryInput = z.infer<typeof updateRegistrySchema>;
