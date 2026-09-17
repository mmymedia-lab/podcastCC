"use server";

import { revalidatePath } from "next/cache";
import { requireEditableProjectStage } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

function requireNotes(raw: FormDataEntryValue | null): string {
  if (typeof raw !== "string" || !raw.trim()) {
    throw new Error("Catatan wajib diisi.");
  }
  return raw.trim();
}

function optionalText(raw: FormDataEntryValue | null): string | null {
  return typeof raw === "string" && raw.trim() ? raw.trim() : null;
}

function optionalInt(raw: FormDataEntryValue | null): number | null {
  const parsed = typeof raw === "string" ? parseInt(raw, 10) : NaN;
  return Number.isFinite(parsed) ? parsed : null;
}

// Deliberately create + delete only — no update. A continuity log is
// corrected live during a shoot by adding or removing entries, not by
// silently rewriting past ones (see the ContinuityNote model comment).
export async function createContinuityNoteAction(
  projectId: string,
  shootingDayId: string,
  formData: FormData,
) {
  await requireEditableProjectStage(projectId, "PRODUKSI");

  await prisma.continuityNote.create({
    data: {
      shootingDayId,
      slate: optionalText(formData.get("slate")),
      takeNumber: optionalInt(formData.get("takeNumber")),
      isGood: formData.get("isGood") === "on",
      notes: requireNotes(formData.get("notes")),
    },
  });

  revalidatePath(`/videos/${projectId}/shooting-days/${shootingDayId}`);
}

export async function deleteContinuityNoteAction(
  projectId: string,
  shootingDayId: string,
  noteId: string,
) {
  await requireEditableProjectStage(projectId, "PRODUKSI");
  await prisma.continuityNote.delete({ where: { id: noteId } });
  revalidatePath(`/videos/${projectId}/shooting-days/${shootingDayId}`);
}
