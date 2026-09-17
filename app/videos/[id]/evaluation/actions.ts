"use server";

import { revalidatePath } from "next/cache";
import { requireEditableProjectStage } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

function requireContent(raw: FormDataEntryValue | null): string {
  if (typeof raw !== "string" || !raw.trim()) {
    throw new Error("Catatan evaluasi wajib diisi.");
  }
  return raw.trim();
}

export async function createEvaluationNoteAction(projectId: string, formData: FormData) {
  await requireEditableProjectStage(projectId, "DISTRIBUSI");

  await prisma.projectEvaluationNote.create({
    data: {
      projectId,
      content: requireContent(formData.get("content")),
    },
  });

  revalidatePath(`/videos/${projectId}/evaluation`);
}

export async function deleteEvaluationNoteAction(projectId: string, noteId: string) {
  await requireEditableProjectStage(projectId, "DISTRIBUSI");
  await prisma.projectEvaluationNote.delete({ where: { id: noteId } });
  revalidatePath(`/videos/${projectId}/evaluation`);
}
