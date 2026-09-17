"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

// Per the system plan's file-storage decision: no upload here at all —
// just a link to an image the team already uploaded to Google Drive.
// Validated as a URL (not restricted to drive.google.com specifically,
// since a team member might paste a Drive "share" shortlink or a
// different host entirely — the point is "no file storage in this app",
// not "must literally be a drive.google.com domain").
function requireDriveUrl(raw: FormDataEntryValue | null): string {
  if (typeof raw !== "string" || !raw.trim()) {
    throw new Error("Link Google Drive wajib diisi.");
  }
  const value = raw.trim();
  try {
    new URL(value);
  } catch {
    throw new Error("Link tidak valid — harus URL lengkap (mis. https://drive.google.com/...).");
  }
  return value;
}

function optionalText(raw: FormDataEntryValue | null): string | null {
  return typeof raw === "string" && raw.trim() ? raw.trim() : null;
}

export async function createStoryboardFrameAction(projectId: string, formData: FormData) {
  await requireSession();

  const last = await prisma.storyboardFrame.findFirst({
    where: { projectId },
    orderBy: { order: "desc" },
  });

  await prisma.storyboardFrame.create({
    data: {
      projectId,
      driveUrl: requireDriveUrl(formData.get("driveUrl")),
      notes: optionalText(formData.get("notes")),
      order: (last?.order ?? 0) + 1,
    },
  });

  revalidatePath(`/videos/${projectId}/storyboard`);
}

export async function updateStoryboardFrameAction(
  projectId: string,
  itemId: string,
  formData: FormData,
) {
  await requireSession();

  await prisma.storyboardFrame.update({
    where: { id: itemId },
    data: {
      driveUrl: requireDriveUrl(formData.get("driveUrl")),
      notes: optionalText(formData.get("notes")),
    },
  });

  revalidatePath(`/videos/${projectId}/storyboard`);
  redirect(`/videos/${projectId}/storyboard`);
}

export async function deleteStoryboardFrameAction(projectId: string, itemId: string) {
  await requireSession();
  await prisma.storyboardFrame.delete({ where: { id: itemId } });
  revalidatePath(`/videos/${projectId}/storyboard`);
}

export async function moveStoryboardFrameAction(
  projectId: string,
  itemId: string,
  direction: "up" | "down",
) {
  await requireSession();

  const items = await prisma.storyboardFrame.findMany({
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
    prisma.storyboardFrame.update({ where: { id: current.id }, data: { order: swapWith.order } }),
    prisma.storyboardFrame.update({ where: { id: swapWith.id }, data: { order: current.order } }),
  ]);

  revalidatePath(`/videos/${projectId}/storyboard`);
}
