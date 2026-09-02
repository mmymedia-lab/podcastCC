"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

function optionalText(raw: FormDataEntryValue | null): string | null {
  return typeof raw === "string" && raw.trim() ? raw.trim() : null;
}

export async function updateShowNotesAction(episodeId: string, formData: FormData) {
  await requireSession();

  await prisma.episode.update({
    where: { id: episodeId },
    data: {
      showNotesDraft: optionalText(formData.get("draft")),
      showNotesExternalUrl: optionalText(formData.get("externalUrl")),
    },
  });

  revalidatePath(`/episodes/${episodeId}/show-notes`);
}
