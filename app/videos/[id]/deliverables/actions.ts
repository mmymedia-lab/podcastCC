"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireEditableProjectStage } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

function requireLabel(raw: FormDataEntryValue | null): string {
  if (typeof raw !== "string" || !raw.trim()) {
    throw new Error("Nama deliverable wajib diisi.");
  }
  return raw.trim();
}

// Unlike StoryboardFrame/EditVersion's driveUrl, the link here is optional:
// a deliverable can be listed before its final asset exists, and the link
// gets filled in once it does.
function optionalDriveUrl(raw: FormDataEntryValue | null): string | null {
  if (typeof raw !== "string" || !raw.trim()) return null;
  const value = raw.trim();
  try {
    new URL(value);
  } catch {
    throw new Error("Link tidak valid — harus URL lengkap (mis. https://drive.google.com/...).");
  }
  return value;
}

export async function createDeliverableAction(projectId: string, formData: FormData) {
  await requireEditableProjectStage(projectId, "DISTRIBUSI");

  const last = await prisma.deliverable.findFirst({
    where: { projectId },
    orderBy: { order: "desc" },
  });

  await prisma.deliverable.create({
    data: {
      projectId,
      label: requireLabel(formData.get("label")),
      driveUrl: optionalDriveUrl(formData.get("driveUrl")),
      order: (last?.order ?? 0) + 1,
    },
  });

  revalidatePath(`/videos/${projectId}/deliverables`);
}

export async function toggleDeliverableAction(projectId: string, deliverableId: string) {
  await requireEditableProjectStage(projectId, "DISTRIBUSI");

  const item = await prisma.deliverable.findUnique({ where: { id: deliverableId } });
  if (!item) return;

  await prisma.deliverable.update({
    where: { id: deliverableId },
    data: { isDone: !item.isDone },
  });

  revalidatePath(`/videos/${projectId}/deliverables`);
}

export async function updateDeliverableAction(
  projectId: string,
  deliverableId: string,
  formData: FormData,
) {
  await requireEditableProjectStage(projectId, "DISTRIBUSI");

  await prisma.deliverable.update({
    where: { id: deliverableId },
    data: {
      label: requireLabel(formData.get("label")),
      driveUrl: optionalDriveUrl(formData.get("driveUrl")),
    },
  });

  revalidatePath(`/videos/${projectId}/deliverables`);
  redirect(`/videos/${projectId}/deliverables`);
}

export async function deleteDeliverableAction(projectId: string, deliverableId: string) {
  await requireEditableProjectStage(projectId, "DISTRIBUSI");
  await prisma.deliverable.delete({ where: { id: deliverableId } });
  revalidatePath(`/videos/${projectId}/deliverables`);
}
