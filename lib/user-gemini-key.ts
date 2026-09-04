import { prisma } from "./prisma";
import { decryptSecret, encryptSecret } from "./crypto";

/**
 * Resolves the Gemini API key a given user's AI requests should use: their
 * own key if they've set one, otherwise undefined so callers fall back to
 * the workspace-wide GEMINI_API_KEY env var (see lib/gemini.ts).
 */
export async function getUserGeminiApiKey(userId: string): Promise<string | undefined> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { geminiApiKeyEncrypted: true },
  });
  if (!user?.geminiApiKeyEncrypted) return undefined;
  return decryptSecret(user.geminiApiKeyEncrypted);
}

export async function setUserGeminiApiKey(userId: string, apiKey: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { geminiApiKeyEncrypted: encryptSecret(apiKey) },
  });
}

export async function clearUserGeminiApiKey(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { geminiApiKeyEncrypted: null },
  });
}
