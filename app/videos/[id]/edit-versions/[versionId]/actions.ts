"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/session";
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
  await requireSession();

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
  await requireSession();

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
  await requireSession();
  await prisma.revisionNote.delete({ where: { id: noteId } });
  revalidatePath(`/videos/${projectId}/edit-versions/${versionId}`);
}
