"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ProjectRoleType } from "@prisma/client";

const ROLE_VALUES: ProjectRoleType[] = [
  "LEADER_PRODUKSI_VIDEO",
  "TIM_PRA_PRODUKSI",
  "TIM_PRODUKSI",
  "TIM_PASCA_PRODUKSI",
];

export async function assignRoleAction(projectId: string, formData: FormData) {
  await requireSession();

  const userId = formData.get("userId");
  const role = formData.get("role");

  if (typeof userId !== "string" || !userId) {
    throw new Error("Pilih anggota tim.");
  }
  if (typeof role !== "string" || !ROLE_VALUES.includes(role as ProjectRoleType)) {
    throw new Error("Peran tidak valid.");
  }

  await prisma.projectRole.upsert({
    where: {
      projectId_userId_role: { projectId, userId, role: role as ProjectRoleType },
    },
    update: {},
    create: { projectId, userId, role: role as ProjectRoleType },
  });

  revalidatePath(`/videos/${projectId}/roles`);
}

export async function removeRoleAction(projectId: string, roleAssignmentId: string) {
  await requireSession();
  await prisma.projectRole.delete({ where: { id: roleAssignmentId } });
  revalidatePath(`/videos/${projectId}/roles`);
}
