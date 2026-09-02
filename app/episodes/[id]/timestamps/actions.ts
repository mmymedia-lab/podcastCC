"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

function requireLabel(raw: FormDataEntryValue | null): string {
  if (typeof raw !== "string" || !raw.trim()) {
    throw new Error("Label chapter wajib diisi.");
  }
  return raw.trim();
}

function requireTimeLabel(raw: FormDataEntryValue | null): string {
  if (typeof raw !== "string" || !raw.trim()) {
    throw new Error("Waktu (mis. 00:12:34) wajib diisi.");
  }
  return raw.trim();
}

export async function createTimestampMarkerAction(episodeId: string, formData: FormData) {
  await requireSession();

  await prisma.timestampMarker.create({
    data: {
      episodeId,
      timeLabel: requireTimeLabel(formData.get("timeLabel")),
      label: requireLabel(formData.get("label")),
    },
  });

  revalidatePath(`/episodes/${episodeId}/timestamps`);
}

export async function updateTimestampMarkerAction(
  episodeId: string,
  markerId: string,
  formData: FormData,
) {
  await requireSession();

  await prisma.timestampMarker.update({
    where: { id: markerId },
    data: {
      timeLabel: requireTimeLabel(formData.get("timeLabel")),
      label: requireLabel(formData.get("label")),
    },
  });

  revalidatePath(`/episodes/${episodeId}/timestamps`);
  redirect(`/episodes/${episodeId}/timestamps`);
}

export async function deleteTimestampMarkerAction(episodeId: string, markerId: string) {
  await requireSession();
  await prisma.timestampMarker.delete({ where: { id: markerId } });
  revalidatePath(`/episodes/${episodeId}/timestamps`);
}
