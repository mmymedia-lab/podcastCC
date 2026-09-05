"use server";

import { revalidatePath } from "next/cache";
import { requireEditableStage } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

function requireContent(raw: FormDataEntryValue | null): string {
  if (typeof raw !== "string" || !raw.trim()) {
    throw new Error("Isi catatan wajib diisi.");
  }
  return raw.trim();
}

export async function createEvaluationNoteAction(episodeId: string, formData: FormData) {
  await requireEditableStage(episodeId, "EVALUASI");

  await prisma.evaluationNote.create({
    data: {
      episodeId,
      content: requireContent(formData.get("content")),
    },
  });

  revalidatePath(`/episodes/${episodeId}/evaluation`);
}

export async function deleteEvaluationNoteAction(episodeId: string, noteId: string) {
  await requireEditableStage(episodeId, "EVALUASI");
  await prisma.evaluationNote.delete({ where: { id: noteId } });
  revalidatePath(`/episodes/${episodeId}/evaluation`);
}

export async function createHostEvaluationAction(episodeId: string, hostId: string, formData: FormData) {
  await requireEditableStage(episodeId, "EVALUASI");

  await prisma.hostEvaluation.create({
    data: {
      episodeId,
      hostId,
      content: requireContent(formData.get("content")),
    },
  });

  revalidatePath(`/episodes/${episodeId}/evaluation`);
}

export async function deleteHostEvaluationAction(episodeId: string, evaluationId: string) {
  await requireEditableStage(episodeId, "EVALUASI");
  await prisma.hostEvaluation.delete({ where: { id: evaluationId } });
  revalidatePath(`/episodes/${episodeId}/evaluation`);
}

/**
 * Turns a follow-up note into a new Bank Tema idea, per PRD.md User Story 24.
 * Idempotent: a note that was already converted is left alone, so double
 * submits (e.g. two quick clicks before the page re-renders) don't create
 * duplicate ideas.
 */
export async function convertNoteToThemeIdeaAction(episodeId: string, noteId: string) {
  await requireEditableStage(episodeId, "EVALUASI");

  const note = await prisma.evaluationNote.findUnique({ where: { id: noteId } });
  if (!note || note.convertedToThemeIdeaAt) return;

  await prisma.themeIdea.create({
    data: { title: note.content },
  });
  await prisma.evaluationNote.update({
    where: { id: noteId },
    data: { convertedToThemeIdeaAt: new Date() },
  });

  revalidatePath("/bank-tema");
  revalidatePath(`/episodes/${episodeId}/evaluation`);
}
