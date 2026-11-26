import type { CreateRegistryInput } from "../schemas/create-registry.schema";
import type { UpdateRegistryInput } from "../schemas/update-registry.schema";
import type { Registry } from "../../domain/schemas/registry.schema";
import { registryRepository } from "../../infrastructure/repositories/registry-repository";

/**
 * Registry service — contains business rules.
 * Receives data already validated by Server Actions.
 * Coordinates repository operations and enforces domain invariants.
 */
export const registryService = {
  async create(userId: string, input: CreateRegistryInput): Promise<Registry> {
    // TODO: implement creation business rules
    return registryRepository.create(userId, input);
  },

  async update(id: string, userId: string, input: UpdateRegistryInput): Promise<Registry> {
    // TODO: implement update business rules and ownership check
    return registryRepository.update(id, userId, input);
  },

  async delete(id: string, userId: string): Promise<void> {
    // TODO: implement soft-delete or hard-delete logic
    return registryRepository.delete(id, userId);
  },
};
