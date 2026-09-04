"use server";

import { requireSession, resolveUserId } from "@/lib/session";
import { prisma } from "@/lib/prisma";

/** Marks the onboarding wizard as seen so it doesn't auto-open again on login. */
export async function dismissOnboardingAction() {
  const session = await requireSession();
  const userId = await resolveUserId(session);
  if (!userId) return;

  await prisma.user.update({
    where: { id: userId },
    data: { hasSeenOnboarding: true },
  });
}
