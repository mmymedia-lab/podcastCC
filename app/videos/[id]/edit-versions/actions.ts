"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireEditableProjectStage } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { EditApprovalStatus, EditVersionStage } from "@prisma/client";
import { APPROVAL_STATUS_ORDER, EDIT_VERSION_STAGE_ORDER } from "./stages";

// Same file-storage decision as StoryboardFrame: no upload, just a
// validated link to a cut already uploaded to Google Drive.
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

// The Picture Lock gate from the research: sound/color/VFX only start
// once a cut has been explicitly approved, because redoing them is
// expensive. Enforced here rather than just in the UI, since server
// actions are the actual authority over what gets written.
async function requireApprovedVersionExists(projectId: string) {
  const approved = await prisma.editVersion.findFirst({
    where: { projectId, approvalStatus: "APPROVED" },
  });
  if (!approved) {
    throw new Error(
      "Picture Lock butuh minimal satu versi yang sudah ditandai \"Disetujui\" terlebih dahulu.",
    );
  }
}

export async function createEditVersionAction(projectId: string, formData: FormData) {
  await requireEditableProjectStage(projectId, "PASCA_PRODUKSI");

  const stage = formData.get("stage");
  if (typeof stage !== "string" || !EDIT_VERSION_STAGE_ORDER.includes(stage as EditVersionStage)) {
    throw new Error("Tahap tidak valid.");
  }
  if (stage === "PICTURE_LOCK") {
    await requireApprovedVersionExists(projectId);
  }

  const driveUrl = requireDriveUrl(formData.get("driveUrl"));

  const last = await prisma.editVersion.findFirst({
    where: { projectId },
    orderBy: { order: "desc" },
  });

  await prisma.editVersion.create({
    data: {
      projectId,
      stage: stage as EditVersionStage,
      driveUrl,
      order: (last?.order ?? 0) + 1,
    },
  });

  revalidatePath(`/videos/${projectId}/edit-versions`);
}

export async function updateApprovalStatusAction(
  projectId: string,
  versionId: string,
  formData: FormData,
) {
  await requireEditableProjectStage(projectId, "PASCA_PRODUKSI");

  const status = formData.get("approvalStatus");
  if (typeof status !== "string" || !APPROVAL_STATUS_ORDER.includes(status as EditApprovalStatus)) {
    throw new Error("Status tidak valid.");
  }

  await prisma.editVersion.update({
    where: { id: versionId },
    data: { approvalStatus: status as EditApprovalStatus },
  });

  revalidatePath(`/videos/${projectId}/edit-versions`);
  revalidatePath(`/videos/${projectId}/edit-versions/${versionId}`);
}

export async function deleteEditVersionAction(projectId: string, versionId: string) {
  await requireEditableProjectStage(projectId, "PASCA_PRODUKSI");
  await prisma.editVersion.delete({ where: { id: versionId } });
  revalidatePath(`/videos/${projectId}/edit-versions`);
  redirect(`/videos/${projectId}/edit-versions`);
}
