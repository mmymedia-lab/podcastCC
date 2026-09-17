"use server";

import { revalidatePath } from "next/cache";
import { requireEditableProjectStage } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

function requireContent(raw: FormDataEntryValue | null): string {
  if (typeof raw !== "string" || !raw.trim()) {
    throw new Error("Isi catatan revisi wajib diisi.");
  }
  return raw.trim();
}

export async function createRevisionNoteAction(
  projectId: string,
  versionId: string,
  formData: FormData,
) {
  await requireEditableProjectStage(projectId, "PASCA_PRODUKSI");

  await prisma.revisionNote.create({
    data: {
      editVersionId: versionId,
      content: requireContent(formData.get("content")),
    },
  });

  revalidatePath(`/videos/${projectId}/edit-versions/${versionId}`);
}

export async function toggleRevisionNoteResolvedAction(
  projectId: string,
  versionId: string,
  noteId: string,
) {
  await requireEditableProjectStage(projectId, "PASCA_PRODUKSI");

  const note = await prisma.revisionNote.findUnique({ where: { id: noteId } });
  if (!note) return;

  await prisma.revisionNote.update({
    where: { id: noteId },
    data: { resolved: !note.resolved },
  });

  revalidatePath(`/videos/${projectId}/edit-versions/${versionId}`);
}

export async function deleteRevisionNoteAction(
  projectId: string,
  versionId: string,
  noteId: string,
) {
  await requireEditableProjectStage(projectId, "PASCA_PRODUKSI");
  await prisma.revisionNote.delete({ where: { id: noteId } });
  revalidatePath(`/videos/${projectId}/edit-versions/${versionId}`);
}
