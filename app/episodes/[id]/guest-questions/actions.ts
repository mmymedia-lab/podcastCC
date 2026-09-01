"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

function requireContent(raw: FormDataEntryValue | null): string {
  if (typeof raw !== "string" || !raw.trim()) {
    throw new Error("Isi pertanyaan wajib diisi.");
  }
  return raw.trim();
}

export async function createGuestQuestionAction(episodeId: string, formData: FormData) {
  await requireSession();

  const last = await prisma.guestQuestion.findFirst({
    where: { episodeId },
    orderBy: { order: "desc" },
  });

  await prisma.guestQuestion.create({
    data: {
      episodeId,
      content: requireContent(formData.get("content")),
      order: (last?.order ?? 0) + 1,
    },
  });

  revalidatePath(`/episodes/${episodeId}/guest-questions`);
}

export async function updateGuestQuestionAction(
  episodeId: string,
  itemId: string,
  formData: FormData,
) {
  await requireSession();

  await prisma.guestQuestion.update({
    where: { id: itemId },
    data: { content: requireContent(formData.get("content")) },
  });

  revalidatePath(`/episodes/${episodeId}/guest-questions`);
  redirect(`/episodes/${episodeId}/guest-questions`);
}

export async function deleteGuestQuestionAction(episodeId: string, itemId: string) {
  await requireSession();
  await prisma.guestQuestion.delete({ where: { id: itemId } });
  revalidatePath(`/episodes/${episodeId}/guest-questions`);
}

export async function moveGuestQuestionAction(
  episodeId: string,
  itemId: string,
  direction: "up" | "down",
) {
  await requireSession();

  const items = await prisma.guestQuestion.findMany({
    where: { episodeId },
    orderBy: { order: "asc" },
  });

  const index = items.findIndex((item) => item.id === itemId);
  if (index === -1) return;

  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (swapIndex < 0 || swapIndex >= items.length) return;

  const current = items[index];
  const swapWith = items[swapIndex];

  await prisma.$transaction([
    prisma.guestQuestion.update({ where: { id: current.id }, data: { order: swapWith.order } }),
    prisma.guestQuestion.update({ where: { id: swapWith.id }, data: { order: current.order } }),
  ]);

  revalidatePath(`/episodes/${episodeId}/guest-questions`);
}
