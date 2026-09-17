"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ProjectStage } from "@prisma/client";
import { STAGE_ORDER } from "./stages";

function requireTitle(raw: FormDataEntryValue | null): string {
  if (typeof raw !== "string" || !raw.trim()) {
    throw new Error("Judul wajib diisi.");
  }
  return raw.trim();
}

// Milestone 1: no role-based stage gating yet (Solo mode only, same as
// the rest of this app pre-Tim-mode) — role-based access for Project
// lands in a later milestone alongside ProjectRole CRUD.
export async function createProjectAction(formData: FormData) {
  await requireSession();

  const project = await prisma.project.create({
    data: { title: requireTitle(formData.get("title")) },
  });

  revalidatePath("/videos");
  redirect(`/videos/${project.id}`);
}

export async function updateProjectAction(id: string, formData: FormData) {
  await requireSession();

  await prisma.project.update({
    where: { id },
    data: { title: requireTitle(formData.get("title")) },
  });

  revalidatePath("/videos");
  revalidatePath(`/videos/${id}`);
  redirect(`/videos/${id}`);
}

export async function updateProjectStageAction(id: string, formData: FormData) {
  await requireSession();

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
  await requireSession();
  await prisma.project.delete({ where: { id } });
  revalidatePath("/videos");
  redirect("/videos");
}
