"use server";

import { revalidatePath } from "next/cache";
import { requireSession, resolveUserId } from "@/lib/session";
import { setWorkspaceMode } from "@/lib/workspace-settings";
import { WorkspaceMode } from "@prisma/client";
import { clearUserGeminiApiKey, setUserGeminiApiKey } from "@/lib/user-gemini-key";

export async function updateWorkspaceModeAction(formData: FormData) {
  await requireSession();

  const mode = formData.get("mode");
  if (mode !== "SOLO" && mode !== "TIM") {
    throw new Error("Mode tidak valid.");
  }

  await setWorkspaceMode(mode as WorkspaceMode);
  revalidatePath("/settings");
}

async function requireUserId(): Promise<string> {
  const session = await requireSession();
  const userId = await resolveUserId(session);
  if (!userId) {
    throw new Error("Sesi tidak valid, silakan login ulang.");
  }
  return userId;
}

export async function setGeminiApiKeyAction(formData: FormData) {
  const userId = await requireUserId();

  const apiKey = formData.get("geminiApiKey");
  if (typeof apiKey !== "string" || !apiKey.trim()) {
    throw new Error("API key wajib diisi.");
  }

  await setUserGeminiApiKey(userId, apiKey.trim());
  revalidatePath("/settings");
}

export async function clearGeminiApiKeyAction() {
  const userId = await requireUserId();
  await clearUserGeminiApiKey(userId);
  revalidatePath("/settings");
}
