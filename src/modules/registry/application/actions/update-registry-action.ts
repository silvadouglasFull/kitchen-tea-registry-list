"use server";

import { updateRegistrySchema, type UpdateRegistryInput } from "../schemas/update-registry.schema";
import { registryService } from "../services/registry-service";

export type ActionResult<T = void> = {
  success: boolean;
  error?: string;
  data?: T;
};

export async function updateRegistryAction(
  id: string,
  rawInput: UpdateRegistryInput,
): Promise<ActionResult<void>> {
  const parsed = updateRegistrySchema.safeParse(rawInput);

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

    await registryService.update(id, "TODO_USER_ID", parsed.data);
    return { success: true };
  } catch {
    return {
      success: false,
      error: "Unable to complete this action right now. Please try again.",
    };
  }
}
