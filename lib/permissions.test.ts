import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./prisma", () => ({
  prisma: {
    workspaceSettings: { findUnique: vi.fn() },
    episodeRole: { findMany: vi.fn() },
  },
}));

import { prisma } from "./prisma";
import { canEditStage } from "./permissions";

const workspaceSettings = prisma.workspaceSettings as unknown as { findUnique: ReturnType<typeof vi.fn> };
const episodeRole = prisma.episodeRole as unknown as { findMany: ReturnType<typeof vi.fn> };

beforeEach(() => {
  workspaceSettings.findUnique.mockReset();
  episodeRole.findMany.mockReset();
});

describe("canEditStage", () => {
  it("allows editing when no workspace settings exist yet", async () => {
    workspaceSettings.findUnique.mockResolvedValue(null);

    expect(await canEditStage("user-1", "ep-1", "RISET_OUTLINE")).toBe(true);
  });

  it("allows editing in Solo mode regardless of roles", async () => {
    workspaceSettings.findUnique.mockResolvedValue({ id: 1, mode: "SOLO" });

    expect(await canEditStage("user-1", "ep-1", "PASCA_PRODUKSI")).toBe(true);
    expect(episodeRole.findMany).not.toHaveBeenCalled();
  });

  it("fails open in Tim mode when the episode has no roles configured", async () => {
    workspaceSettings.findUnique.mockResolvedValue({ id: 1, mode: "TIM" });
    episodeRole.findMany.mockResolvedValue([]);

    expect(await canEditStage("user-1", "ep-1", "PUBLISH_DISTRIBUSI")).toBe(true);
  });

  it("denies a user with no role on the episode once roles are configured", async () => {
    workspaceSettings.findUnique.mockResolvedValue({ id: 1, mode: "TIM" });
    episodeRole.findMany.mockResolvedValue([
      { episodeId: "ep-1", userId: "other-user", role: "PRODUCER" },
    ]);

    expect(await canEditStage("user-1", "ep-1", "RISET_OUTLINE")).toBe(false);
  });

  it("denies a role that isn't allowed to edit the given stage", async () => {
    workspaceSettings.findUnique.mockResolvedValue({ id: 1, mode: "TIM" });
    episodeRole.findMany.mockResolvedValue([
      { episodeId: "ep-1", userId: "user-1", role: "EDITOR" },
    ]);

    // EDITOR can't edit RISET_OUTLINE per STAGE_ROLE_ACCESS.
    expect(await canEditStage("user-1", "ep-1", "RISET_OUTLINE")).toBe(false);
  });

  it("allows a role that is allowed to edit the given stage", async () => {
    workspaceSettings.findUnique.mockResolvedValue({ id: 1, mode: "TIM" });
    episodeRole.findMany.mockResolvedValue([
      { episodeId: "ep-1", userId: "user-1", role: "EDITOR" },
    ]);

    expect(await canEditStage("user-1", "ep-1", "PASCA_PRODUKSI")).toBe(true);
  });

  it("always allows PRODUCER regardless of stage", async () => {
    workspaceSettings.findUnique.mockResolvedValue({ id: 1, mode: "TIM" });
    episodeRole.findMany.mockResolvedValue([
      { episodeId: "ep-1", userId: "user-1", role: "PRODUCER" },
    ]);

    for (const stage of [
      "BANK_TEMA",
      "RISET_OUTLINE",
      "PRA_PRODUKSI",
      "PANDUAN_EKSEKUSI",
      "PASCA_PRODUKSI",
      "PUBLISH_DISTRIBUSI",
      "EVALUASI",
    ] as const) {
      expect(await canEditStage("user-1", "ep-1", stage)).toBe(true);
    }
  });
});
