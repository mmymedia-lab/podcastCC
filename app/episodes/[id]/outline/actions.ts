"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireEditableStage } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

function requireContent(raw: FormDataEntryValue | null): string {
  if (typeof raw !== "string" || !raw.trim()) {
    throw new Error("Isi poin bicara wajib diisi.");
  }
  return raw.trim();
}

function optionalUrl(raw: FormDataEntryValue | null): string | null {
  return typeof raw === "string" && raw.trim() ? raw.trim() : null;
}

export async function createOutlineItemAction(episodeId: string, formData: FormData) {
  await requireEditableStage(episodeId, "RISET_OUTLINE");

  const last = await prisma.outlineItem.findFirst({
    where: { episodeId },
    orderBy: { order: "desc" },
  });

  await prisma.outlineItem.create({
    data: {
      episodeId,
      content: requireContent(formData.get("content")),
      referenceUrl: optionalUrl(formData.get("referenceUrl")),
      order: (last?.order ?? 0) + 1,
    },
  });

  revalidatePath(`/episodes/${episodeId}/outline`);
}

export async function updateOutlineItemAction(
  episodeId: string,
  itemId: string,
  formData: FormData,
) {
  await requireEditableStage(episodeId, "RISET_OUTLINE");

  await prisma.outlineItem.update({
    where: { id: itemId },
    data: {
      content: requireContent(formData.get("content")),
      referenceUrl: optionalUrl(formData.get("referenceUrl")),
    },
  });

  revalidatePath(`/episodes/${episodeId}/outline`);
  redirect(`/episodes/${episodeId}/outline`);
}

export async function deleteOutlineItemAction(episodeId: string, itemId: string) {
  await requireEditableStage(episodeId, "RISET_OUTLINE");
  await prisma.outlineItem.delete({ where: { id: itemId } });
  revalidatePath(`/episodes/${episodeId}/outline`);
}

export async function moveOutlineItemAction(
  episodeId: string,
  itemId: string,
  direction: "up" | "down",
) {
  await requireEditableStage(episodeId, "RISET_OUTLINE");

  const items = await prisma.outlineItem.findMany({
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
    prisma.outlineItem.update({ where: { id: current.id }, data: { order: swapWith.order } }),
    prisma.outlineItem.update({ where: { id: swapWith.id }, data: { order: current.order } }),
  ]);

  revalidatePath(`/episodes/${episodeId}/outline`);
}
