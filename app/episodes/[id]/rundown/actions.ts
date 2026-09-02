"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

function requireTitle(raw: FormDataEntryValue | null): string {
  if (typeof raw !== "string" || !raw.trim()) {
    throw new Error("Judul segmen wajib diisi.");
  }
  return raw.trim();
}

function requireTalkingPoints(raw: FormDataEntryValue | null): string {
  if (typeof raw !== "string" || !raw.trim()) {
    throw new Error("Talking points wajib diisi.");
  }
  return raw.trim();
}

function parseMinutes(raw: FormDataEntryValue | null): number {
  const value = typeof raw === "string" ? Number.parseInt(raw, 10) : NaN;
  return Number.isFinite(value) && value > 0 ? value : 5;
}

export async function createRundownSegmentAction(episodeId: string, formData: FormData) {
  await requireSession();

  const last = await prisma.rundownSegment.findFirst({
    where: { episodeId },
    orderBy: { order: "desc" },
  });

  await prisma.rundownSegment.create({
    data: {
      episodeId,
      title: requireTitle(formData.get("title")),
      talkingPoints: requireTalkingPoints(formData.get("talkingPoints")),
      estimatedMinutes: parseMinutes(formData.get("estimatedMinutes")),
      order: (last?.order ?? 0) + 1,
    },
  });

  revalidatePath(`/episodes/${episodeId}/rundown`);
}

export async function updateRundownSegmentAction(
  episodeId: string,
  segmentId: string,
  formData: FormData,
) {
  await requireSession();

  await prisma.rundownSegment.update({
    where: { id: segmentId },
    data: {
      title: requireTitle(formData.get("title")),
      talkingPoints: requireTalkingPoints(formData.get("talkingPoints")),
      estimatedMinutes: parseMinutes(formData.get("estimatedMinutes")),
    },
  });

  revalidatePath(`/episodes/${episodeId}/rundown`);
  redirect(`/episodes/${episodeId}/rundown`);
}

export async function deleteRundownSegmentAction(episodeId: string, segmentId: string) {
  await requireSession();
  await prisma.rundownSegment.delete({ where: { id: segmentId } });
  revalidatePath(`/episodes/${episodeId}/rundown`);
}

export async function moveRundownSegmentAction(
  episodeId: string,
  segmentId: string,
  direction: "up" | "down",
) {
  await requireSession();

  const segments = await prisma.rundownSegment.findMany({
    where: { episodeId },
    orderBy: { order: "asc" },
  });

  const index = segments.findIndex((segment) => segment.id === segmentId);
  if (index === -1) return;

  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (swapIndex < 0 || swapIndex >= segments.length) return;

  const current = segments[index];
  const swapWith = segments[swapIndex];

  await prisma.$transaction([
    prisma.rundownSegment.update({ where: { id: current.id }, data: { order: swapWith.order } }),
    prisma.rundownSegment.update({ where: { id: swapWith.id }, data: { order: current.order } }),
  ]);

  revalidatePath(`/episodes/${episodeId}/rundown`);
}
