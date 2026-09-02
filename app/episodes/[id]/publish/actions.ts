"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/session";
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
  await requireSession();

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
