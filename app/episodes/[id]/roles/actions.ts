"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { EpisodeRoleType } from "@prisma/client";

const ROLE_VALUES: EpisodeRoleType[] = [
  "LEADER_PRODUKSI",
  "TIM_BRAINSTORMING",
  "TIM_LIVE",
  "TIM_EVALUASI",
];

export async function assignRoleAction(episodeId: string, formData: FormData) {
  await requireSession();

  const userId = formData.get("userId");
  const role = formData.get("role");

  if (typeof userId !== "string" || !userId) {
    throw new Error("Pilih anggota tim.");
  }
  if (typeof role !== "string" || !ROLE_VALUES.includes(role as EpisodeRoleType)) {
    throw new Error("Peran tidak valid.");
  }

  await prisma.episodeRole.upsert({
    where: {
      episodeId_userId_role: { episodeId, userId, role: role as EpisodeRoleType },
    },
    update: {},
    create: { episodeId, userId, role: role as EpisodeRoleType },
  });

  revalidatePath(`/episodes/${episodeId}/roles`);
}

export async function removeRoleAction(episodeId: string, roleAssignmentId: string) {
  await requireSession();
  await prisma.episodeRole.delete({ where: { id: roleAssignmentId } });
  revalidatePath(`/episodes/${episodeId}/roles`);
}
