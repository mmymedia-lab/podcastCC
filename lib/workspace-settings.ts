import { WorkspaceMode } from "@prisma/client";
import { prisma } from "./prisma";

const SINGLETON_ID = 1;

/** Reads the workspace settings, creating the default (Solo) row on first access. */
export async function getWorkspaceSettings() {
  return prisma.workspaceSettings.upsert({
    where: { id: SINGLETON_ID },
    update: {},
    create: { id: SINGLETON_ID },
  });
}

/**
 * Updates only the `mode` column on the singleton settings row. This never
 * touches any other table, so switching modes back and forth cannot corrupt
 * episode data (there is no relation from WorkspaceSettings to Episode).
 */
export async function setWorkspaceMode(mode: WorkspaceMode) {
  return prisma.workspaceSettings.upsert({
    where: { id: SINGLETON_ID },
    update: { mode },
    create: { id: SINGLETON_ID, mode },
  });
}
