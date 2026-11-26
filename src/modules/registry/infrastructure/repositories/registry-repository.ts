import { db } from "@/shared/database/client";
import type { CreateRegistryInput } from "../../application/schemas/create-registry.schema";
import type { UpdateRegistryInput } from "../../application/schemas/update-registry.schema";
import type { Registry } from "../../domain/schemas/registry.schema";

/**
 * Registry repository — contains only Drizzle ORM persistence queries.
 * No business rules here. No Drizzle-specific types exposed outside this layer.
 */
export const registryRepository = {
  async create(userId: string, input: CreateRegistryInput): Promise<Registry> {
    // TODO: implement Drizzle insert
    // const [row] = await db.insert(registryTable).values({ ...input, userId }).returning();
    // return row;
    void db; void userId; void input;
    throw new Error("Not implemented");
  },

  async update(id: string, userId: string, input: UpdateRegistryInput): Promise<Registry> {
    // TODO: implement Drizzle update with ownership check
    void id; void userId; void input;
    throw new Error("Not implemented");
  },

  async delete(id: string, userId: string): Promise<void> {
    // TODO: implement Drizzle soft-delete or hard-delete
    void id; void userId;
    throw new Error("Not implemented");
  },
};
