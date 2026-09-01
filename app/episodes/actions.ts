"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { EpisodeStage } from "@prisma/client";
import { STAGE_ORDER } from "./stages";

export async function convertThemeIdeaToEpisodeAction(themeIdeaId: string) {
  await requireSession();

  const idea = await prisma.themeIdea.findUnique({ where: { id: themeIdeaId } });
  if (!idea) throw new Error("Ide tidak ditemukan.");
  if (idea.episodeId) throw new Error("Ide ini sudah punya episode.");

  const episode = await prisma.episode.create({
    data: { title: idea.title, stage: "RISET_OUTLINE" },
  });

  await prisma.themeIdea.update({
    where: { id: idea.id },
    data: { status: "SELECTED", episodeId: episode.id },
  });

  revalidatePath("/bank-tema");
  revalidatePath("/episodes");
  redirect(`/episodes/${episode.id}`);
}

export async function updateEpisodeStageAction(episodeId: string, formData: FormData) {
  await requireSession();

  const stage = formData.get("stage");
  if (typeof stage !== "string" || !STAGE_ORDER.includes(stage as EpisodeStage)) {
    throw new Error("Tahap tidak valid.");
  }

  await prisma.episode.update({
    where: { id: episodeId },
    data: { stage: stage as EpisodeStage },
  });

  revalidatePath(`/episodes/${episodeId}`);
  revalidatePath("/episodes");
}
