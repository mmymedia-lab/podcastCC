"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireEditableStage } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

function requireName(raw: FormDataEntryValue | null): string {
  if (typeof raw !== "string" || !raw.trim()) {
    throw new Error("Nama tamu wajib diisi.");
  }
  return raw.trim();
}

function optionalText(raw: FormDataEntryValue | null): string | null {
  return typeof raw === "string" && raw.trim() ? raw.trim() : null;
}

export async function createGuestAction(episodeId: string, formData: FormData) {
  await requireEditableStage(episodeId, "PRA_PRODUKSI");

  await prisma.guest.create({
    data: {
      episodeId,
      name: requireName(formData.get("name")),
      contact: optionalText(formData.get("contact")),
      briefingNotes: optionalText(formData.get("briefingNotes")),
    },
  });

  revalidatePath(`/episodes/${episodeId}/guests`);
}

export async function updateGuestAction(episodeId: string, guestId: string, formData: FormData) {
  await requireEditableStage(episodeId, "PRA_PRODUKSI");

  await prisma.guest.update({
    where: { id: guestId },
    data: {
      name: requireName(formData.get("name")),
      contact: optionalText(formData.get("contact")),
      briefingNotes: optionalText(formData.get("briefingNotes")),
    },
  });

  revalidatePath(`/episodes/${episodeId}/guests`);
  redirect(`/episodes/${episodeId}/guests`);
}

export async function deleteGuestAction(episodeId: string, guestId: string) {
  await requireEditableStage(episodeId, "PRA_PRODUKSI");
  await prisma.guest.delete({ where: { id: guestId } });
  revalidatePath(`/episodes/${episodeId}/guests`);
}
