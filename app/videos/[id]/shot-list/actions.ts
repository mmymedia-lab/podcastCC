"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireEditableProjectStage } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

function requireDescription(raw: FormDataEntryValue | null): string {
  if (typeof raw !== "string" || !raw.trim()) {
    throw new Error("Deskripsi shot wajib diisi.");
  }
  return raw.trim();
}

function optionalText(raw: FormDataEntryValue | null): string | null {
  return typeof raw === "string" && raw.trim() ? raw.trim() : null;
}

function parseMinutes(raw: FormDataEntryValue | null): number {
  const parsed = typeof raw === "string" ? parseInt(raw, 10) : NaN;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 5;
}

export async function createShotListItemAction(projectId: string, formData: FormData) {
  await requireEditableProjectStage(projectId, "PRA_PRODUKSI");

  const last = await prisma.shotListItem.findFirst({
    where: { projectId },
    orderBy: { order: "desc" },
  });

  await prisma.shotListItem.create({
    data: {
      projectId,
      description: requireDescription(formData.get("description")),
      angle: optionalText(formData.get("angle")),
      lens: optionalText(formData.get("lens")),
      estimatedMinutes: parseMinutes(formData.get("estimatedMinutes")),
      order: (last?.order ?? 0) + 1,
    },
  });

  revalidatePath(`/videos/${projectId}/shot-list`);
}

export async function updateShotListItemAction(
  projectId: string,
  itemId: string,
  formData: FormData,
) {
  await requireEditableProjectStage(projectId, "PRA_PRODUKSI");

  await prisma.shotListItem.update({
    where: { id: itemId },
    data: {
      description: requireDescription(formData.get("description")),
      angle: optionalText(formData.get("angle")),
      lens: optionalText(formData.get("lens")),
      estimatedMinutes: parseMinutes(formData.get("estimatedMinutes")),
    },
  });

  revalidatePath(`/videos/${projectId}/shot-list`);
  redirect(`/videos/${projectId}/shot-list`);
}

export async function deleteShotListItemAction(projectId: string, itemId: string) {
  await requireEditableProjectStage(projectId, "PRA_PRODUKSI");
  await prisma.shotListItem.delete({ where: { id: itemId } });
  revalidatePath(`/videos/${projectId}/shot-list`);
}

export async function moveShotListItemAction(
  projectId: string,
  itemId: string,
  direction: "up" | "down",
) {
  await requireEditableProjectStage(projectId, "PRA_PRODUKSI");

  const items = await prisma.shotListItem.findMany({
    where: { projectId },
    orderBy: { order: "asc" },
  });

  const index = items.findIndex((item) => item.id === itemId);
  if (index === -1) return;

  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (swapIndex < 0 || swapIndex >= items.length) return;

  const current = items[index];
  const swapWith = items[swapIndex];

  await prisma.$transaction([
    prisma.shotListItem.update({ where: { id: current.id }, data: { order: swapWith.order } }),
    prisma.shotListItem.update({ where: { id: swapWith.id }, data: { order: current.order } }),
  ]);

  revalidatePath(`/videos/${projectId}/shot-list`);
}
