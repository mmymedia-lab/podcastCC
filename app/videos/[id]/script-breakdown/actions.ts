"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

function requireLocation(raw: FormDataEntryValue | null): string {
  if (typeof raw !== "string" || !raw.trim()) {
    throw new Error("Lokasi wajib diisi.");
  }
  return raw.trim();
}

function optionalText(raw: FormDataEntryValue | null): string | null {
  return typeof raw === "string" && raw.trim() ? raw.trim() : null;
}

export async function createScriptBreakdownAction(projectId: string, formData: FormData) {
  await requireSession();

  const last = await prisma.scriptBreakdown.findFirst({
    where: { projectId },
    orderBy: { order: "desc" },
  });

  await prisma.scriptBreakdown.create({
    data: {
      projectId,
      location: requireLocation(formData.get("location")),
      props: optionalText(formData.get("props")),
      cast: optionalText(formData.get("cast")),
      notes: optionalText(formData.get("notes")),
      order: (last?.order ?? 0) + 1,
    },
  });

  revalidatePath(`/videos/${projectId}/script-breakdown`);
}

export async function updateScriptBreakdownAction(
  projectId: string,
  itemId: string,
  formData: FormData,
) {
  await requireSession();

  await prisma.scriptBreakdown.update({
    where: { id: itemId },
    data: {
      location: requireLocation(formData.get("location")),
      props: optionalText(formData.get("props")),
      cast: optionalText(formData.get("cast")),
      notes: optionalText(formData.get("notes")),
    },
  });

  revalidatePath(`/videos/${projectId}/script-breakdown`);
  redirect(`/videos/${projectId}/script-breakdown`);
}

export async function deleteScriptBreakdownAction(projectId: string, itemId: string) {
  await requireSession();
  await prisma.scriptBreakdown.delete({ where: { id: itemId } });
  revalidatePath(`/videos/${projectId}/script-breakdown`);
}

export async function moveScriptBreakdownAction(
  projectId: string,
  itemId: string,
  direction: "up" | "down",
) {
  await requireSession();

  const items = await prisma.scriptBreakdown.findMany({
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
    prisma.scriptBreakdown.update({ where: { id: current.id }, data: { order: swapWith.order } }),
    prisma.scriptBreakdown.update({ where: { id: swapWith.id }, data: { order: current.order } }),
  ]);

  revalidatePath(`/videos/${projectId}/script-breakdown`);
}
