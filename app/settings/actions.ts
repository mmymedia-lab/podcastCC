"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/session";
import { setWorkspaceMode } from "@/lib/workspace-settings";
import { WorkspaceMode } from "@prisma/client";

export async function updateWorkspaceModeAction(formData: FormData) {
  await requireSession();

  const mode = formData.get("mode");
  if (mode !== "SOLO" && mode !== "TIM") {
    throw new Error("Mode tidak valid.");
  }

  await setWorkspaceMode(mode as WorkspaceMode);
  revalidatePath("/settings");
}
