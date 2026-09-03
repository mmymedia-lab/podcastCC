"use server";

import { revalidatePath } from "next/cache";
import { requireEditableStage } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

function optionalText(raw: FormDataEntryValue | null): string | null {
  return typeof raw === "string" && raw.trim() ? raw.trim() : null;
}

function parseTags(raw: FormDataEntryValue | null): string[] {
  if (typeof raw !== "string") return [];
  return raw
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export async function updatePublishMetadataAction(episodeId: string, formData: FormData) {
  await requireEditableStage(episodeId, "PUBLISH_DISTRIBUSI");

  await prisma.episode.update({
    where: { id: episodeId },
    data: {
      publishTitle: optionalText(formData.get("publishTitle")),
      publishDescription: optionalText(formData.get("publishDescription")),
      publishTags: parseTags(formData.get("publishTags")),
    },
  });

  revalidatePath(`/episodes/${episodeId}/publish`);
}
