"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/session";
import { requireEditableProjectStage } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { ProjectStage } from "@prisma/client";
import { STAGE_ORDER } from "./stages";
import { createProjectDriveFolder } from "@/lib/google-drive";

function requireTitle(raw: FormDataEntryValue | null): string {
  if (typeof raw !== "string" || !raw.trim()) {
    throw new Error("Judul wajib diisi.");
  }
  return raw.trim();
}

async function requireExistingProjectStage(id: string): Promise<ProjectStage> {
  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) throw new Error("Proyek tidak ditemukan.");
  return project.stage;
}

// No project exists yet at creation time, so there's nothing to gate on —
// matches convertThemeIdeaToEpisodeAction on the podcast side.
export async function createProjectAction(formData: FormData) {
  await requireSession();

  const title = requireTitle(formData.get("title"));
  const project = await prisma.project.create({ data: { title } });

  const driveFolderUrl = await createProjectDriveFolder(title);
  if (driveFolderUrl) {
    await prisma.project.update({ where: { id: project.id }, data: { driveFolderUrl } });
  }

  revalidatePath("/videos");
  redirect(`/videos/${project.id}`);
}

export async function updateProjectAction(id: string, formData: FormData) {
  await requireEditableProjectStage(id, await requireExistingProjectStage(id));

  await prisma.project.update({
    where: { id },
    data: { title: requireTitle(formData.get("title")) },
  });

  revalidatePath("/videos");
  revalidatePath(`/videos/${id}`);
  redirect(`/videos/${id}`);
}

export async function updateProjectStageAction(id: string, formData: FormData) {
  // Gate on the CURRENT stage: moving the pipeline marker forward is itself
  // an edit of whatever stage the project is presently in.
  await requireEditableProjectStage(id, await requireExistingProjectStage(id));

  const stage = formData.get("stage");
  if (typeof stage !== "string" || !STAGE_ORDER.includes(stage as ProjectStage)) {
    throw new Error("Tahap tidak valid.");
  }

  await prisma.project.update({
    where: { id },
    data: { stage: stage as ProjectStage },
  });

  revalidatePath(`/videos/${id}`);
  revalidatePath("/videos");
}

export async function deleteProjectAction(id: string) {
  await requireEditableProjectStage(id, await requireExistingProjectStage(id));
  await prisma.project.delete({ where: { id } });
  revalidatePath("/videos");
  redirect("/videos");
}
