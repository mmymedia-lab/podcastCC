"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ChecklistCategory } from "@prisma/client";

function requireLabel(raw: FormDataEntryValue | null): string {
  if (typeof raw !== "string" || !raw.trim()) {
    throw new Error("Item checklist wajib diisi.");
  }
  return raw.trim();
}

export async function createChecklistItemAction(
  episodeId: string,
  category: ChecklistCategory,
  slug: string,
  formData: FormData,
) {
  await requireSession();

  const last = await prisma.checklistItem.findFirst({
    where: { episodeId, category },
    orderBy: { order: "desc" },
  });

  await prisma.checklistItem.create({
    data: {
      episodeId,
      category,
      label: requireLabel(formData.get("label")),
      order: (last?.order ?? 0) + 1,
    },
  });

  revalidatePath(`/episodes/${episodeId}/checklist/${slug}`);
}

export async function toggleChecklistItemAction(episodeId: string, slug: string, itemId: string) {
  await requireSession();

  const item = await prisma.checklistItem.findUnique({ where: { id: itemId } });
  if (!item) return;

  await prisma.checklistItem.update({
    where: { id: itemId },
    data: { isDone: !item.isDone },
  });

  revalidatePath(`/episodes/${episodeId}/checklist/${slug}`);
}

export async function deleteChecklistItemAction(episodeId: string, slug: string, itemId: string) {
  await requireSession();
  await prisma.checklistItem.delete({ where: { id: itemId } });
  revalidatePath(`/episodes/${episodeId}/checklist/${slug}`);
}
