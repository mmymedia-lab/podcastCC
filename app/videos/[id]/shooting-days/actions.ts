"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireEditableProjectStage } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

function optionalText(raw: FormDataEntryValue | null): string | null {
  return typeof raw === "string" && raw.trim() ? raw.trim() : null;
}

function optionalDate(raw: FormDataEntryValue | null): Date | null {
  return typeof raw === "string" && raw ? new Date(raw) : null;
}

export async function createShootingDayAction(projectId: string, formData: FormData) {
  await requireEditableProjectStage(projectId, "PRODUKSI");

  const last = await prisma.shootingDay.findFirst({
    where: { projectId },
    orderBy: { order: "desc" },
  });

  await prisma.shootingDay.create({
    data: {
      projectId,
      scheduledDate: optionalDate(formData.get("scheduledDate")),
      callTime: optionalText(formData.get("callTime")),
      location: optionalText(formData.get("location")),
      sceneSchedule: optionalText(formData.get("sceneSchedule")),
      wrapEstimate: optionalText(formData.get("wrapEstimate")),
      notes: optionalText(formData.get("notes")),
      order: (last?.order ?? 0) + 1,
    },
  });

  revalidatePath(`/videos/${projectId}/shooting-days`);
}

export async function updateShootingDayAction(projectId: string, dayId: string, formData: FormData) {
  await requireEditableProjectStage(projectId, "PRODUKSI");

  await prisma.shootingDay.update({
    where: { id: dayId },
    data: {
      scheduledDate: optionalDate(formData.get("scheduledDate")),
      callTime: optionalText(formData.get("callTime")),
      location: optionalText(formData.get("location")),
      sceneSchedule: optionalText(formData.get("sceneSchedule")),
      wrapEstimate: optionalText(formData.get("wrapEstimate")),
      notes: optionalText(formData.get("notes")),
    },
  });

  revalidatePath(`/videos/${projectId}/shooting-days`);
  revalidatePath(`/videos/${projectId}/shooting-days/${dayId}`);
  redirect(`/videos/${projectId}/shooting-days/${dayId}`);
}

export async function deleteShootingDayAction(projectId: string, dayId: string) {
  await requireEditableProjectStage(projectId, "PRODUKSI");
  await prisma.shootingDay.delete({ where: { id: dayId } });
  revalidatePath(`/videos/${projectId}/shooting-days`);
  redirect(`/videos/${projectId}/shooting-days`);
}
