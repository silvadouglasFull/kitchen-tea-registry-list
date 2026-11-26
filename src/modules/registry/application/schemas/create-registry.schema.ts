import { z } from "zod";

/**
 * Input schema for creating a Registry.
 * Excludes persistence-managed fields: id, createdAt, updatedAt, deletedAt.
 */
export const createRegistrySchema = z.object({
  title: z.string().trim().min(1).max(255),
  description: z.string().trim().optional(),
});

export type CreateRegistryInput = z.infer<typeof createRegistrySchema>;
