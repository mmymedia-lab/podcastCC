"use server";

import { revalidatePath } from "next/cache";
import { requireEditableStage } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { ChecklistCategory, EpisodeStage } from "@prisma/client";
import { slugToCategory } from "./categories";

function requireLabel(raw: FormDataEntryValue | null): string {
  if (typeof raw !== "string" || !raw.trim()) {
    throw new Error("Item checklist wajib diisi.");
  }
  return raw.trim();
}

const CATEGORY_STAGE: Record<ChecklistCategory, EpisodeStage> = {
  PRE_PRODUCTION: "PRA_PRODUKSI",
  POST_PRODUCTION: "PASCA_PRODUKSI",
  PUBLISH: "PUBLISH_DISTRIBUSI",
};

async function requireEditableChecklistStage(episodeId: string, slug: string) {
  const category = slugToCategory(slug);
  if (!category) {
    throw new Error("Kategori checklist tidak valid.");
  }
  await requireEditableStage(episodeId, CATEGORY_STAGE[category]);
}

export async function createChecklistItemAction(
  episodeId: string,
  category: ChecklistCategory,
  slug: string,
  formData: FormData,
) {
  await requireEditableStage(episodeId, CATEGORY_STAGE[category]);

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
  await requireEditableChecklistStage(episodeId, slug);

  const item = await prisma.checklistItem.findUnique({ where: { id: itemId } });
  if (!item) return;

  await prisma.checklistItem.update({
    where: { id: itemId },
    data: { isDone: !item.isDone },
  });

  revalidatePath(`/episodes/${episodeId}/checklist/${slug}`);
}

export async function deleteChecklistItemAction(episodeId: string, slug: string, itemId: string) {
  await requireEditableChecklistStage(episodeId, slug);
  await prisma.checklistItem.delete({ where: { id: itemId } });
  revalidatePath(`/episodes/${episodeId}/checklist/${slug}`);
}
