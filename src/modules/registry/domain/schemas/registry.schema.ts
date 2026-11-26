import { z } from "zod";
import { createRegistrySchema } from "../../application/schemas/create-registry.schema";

/**
 * Domain / output schema for Registry.
 * Extends the creation schema with persistence-managed fields.
 * Never expose internal DB fields (deletedAt, etc.) through this schema.
 */
export const registrySchema = createRegistrySchema.extend({
  id: z.string().uuid(),
  createdAt: z.string().datetime(),
});

export type Registry = z.infer<typeof registrySchema>;
