"use server";

import { createRegistrySchema, type CreateRegistryInput } from "../schemas/create-registry.schema";
import { registryService } from "../services/registry-service";

export type ActionResult<T = void> = {
  success: boolean;
  error?: string;
  data?: T;
};

export async function createRegistryAction(
  rawInput: CreateRegistryInput,
): Promise<ActionResult<{ id: string }>> {
  const parsed = createRegistrySchema.safeParse(rawInput);

  if (!parsed.success) {
    return {
      success: false,
      error: "Please check the form fields and try again.",
    };
  }

  try {
    // TODO: get authenticated user session
    // const session = await auth();
    // if (!session?.user?.id) {
    //   return { success: false, error: "You must be signed in." };
    // }
    // const sessionUserId = session.user.id;

    const created = await registryService.create("TODO_USER_ID", parsed.data);
    return { success: true, data: { id: created.id } };
  } catch {
    return {
      success: false,
      error: "Unable to complete this action right now. Please try again.",
    };
  }
}
