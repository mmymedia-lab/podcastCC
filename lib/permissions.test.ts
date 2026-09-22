import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./prisma", () => ({
  prisma: {
    workspaceSettings: { findUnique: vi.fn() },
    episodeRole: { findMany: vi.fn() },
    projectRole: { findMany: vi.fn(), findFirst: vi.fn() },
    user: { findUnique: vi.fn() },
  },
}));

import { prisma } from "./prisma";
import { canDeleteProject, canEditProjectStage, canEditStage } from "./permissions";

const workspaceSettings = prisma.workspaceSettings as unknown as { findUnique: ReturnType<typeof vi.fn> };
const episodeRole = prisma.episodeRole as unknown as { findMany: ReturnType<typeof vi.fn> };
const projectRole = prisma.projectRole as unknown as {
  findMany: ReturnType<typeof vi.fn>;
  findFirst: ReturnType<typeof vi.fn>;
};
const user = prisma.user as unknown as { findUnique: ReturnType<typeof vi.fn> };

beforeEach(() => {
  workspaceSettings.findUnique.mockReset();
  episodeRole.findMany.mockReset();
  projectRole.findMany.mockReset();
  projectRole.findFirst.mockReset();
  user.findUnique.mockReset();
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
      { episodeId: "ep-1", userId: "other-user", role: "LEADER_PRODUKSI" },
    ]);

    expect(await canEditStage("user-1", "ep-1", "RISET_OUTLINE")).toBe(false);
  });

  it("denies a role that isn't allowed to edit the given stage", async () => {
    workspaceSettings.findUnique.mockResolvedValue({ id: 1, mode: "TIM" });
    episodeRole.findMany.mockResolvedValue([
      { episodeId: "ep-1", userId: "user-1", role: "TIM_EVALUASI" },
    ]);

    // TIM_EVALUASI can't edit RISET_OUTLINE per STAGE_ROLE_ACCESS.
    expect(await canEditStage("user-1", "ep-1", "RISET_OUTLINE")).toBe(false);
  });

  it("allows a role that is allowed to edit the given stage", async () => {
    workspaceSettings.findUnique.mockResolvedValue({ id: 1, mode: "TIM" });
    episodeRole.findMany.mockResolvedValue([
      { episodeId: "ep-1", userId: "user-1", role: "TIM_EVALUASI" },
    ]);

    expect(await canEditStage("user-1", "ep-1", "PASCA_PRODUKSI")).toBe(true);
  });

  it("always allows LEADER_PRODUKSI regardless of stage", async () => {
    workspaceSettings.findUnique.mockResolvedValue({ id: 1, mode: "TIM" });
    episodeRole.findMany.mockResolvedValue([
      { episodeId: "ep-1", userId: "user-1", role: "LEADER_PRODUKSI" },
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

describe("canEditProjectStage", () => {
  it("allows editing when no workspace settings exist yet", async () => {
    workspaceSettings.findUnique.mockResolvedValue(null);

    expect(await canEditProjectStage("user-1", "proj-1", "PRA_PRODUKSI")).toBe(true);
  });

  it("allows editing in Solo mode regardless of roles", async () => {
    workspaceSettings.findUnique.mockResolvedValue({ id: 1, mode: "SOLO" });

    expect(await canEditProjectStage("user-1", "proj-1", "DISTRIBUSI")).toBe(true);
    expect(projectRole.findMany).not.toHaveBeenCalled();
  });

  it("fails open in Tim mode when the project has no roles configured", async () => {
    workspaceSettings.findUnique.mockResolvedValue({ id: 1, mode: "TIM" });
    projectRole.findMany.mockResolvedValue([]);

    expect(await canEditProjectStage("user-1", "proj-1", "DISTRIBUSI")).toBe(true);
  });

  it("denies a user with no role on the project once roles are configured", async () => {
    workspaceSettings.findUnique.mockResolvedValue({ id: 1, mode: "TIM" });
    projectRole.findMany.mockResolvedValue([
      { projectId: "proj-1", userId: "other-user", role: "LEADER_PRODUKSI_VIDEO" },
    ]);

    expect(await canEditProjectStage("user-1", "proj-1", "PRA_PRODUKSI")).toBe(false);
  });

  it("denies a role that isn't allowed to edit the given stage", async () => {
    workspaceSettings.findUnique.mockResolvedValue({ id: 1, mode: "TIM" });
    projectRole.findMany.mockResolvedValue([
      { projectId: "proj-1", userId: "user-1", role: "TIM_PRODUKSI" },
    ]);

    // TIM_PRODUKSI can't edit PRA_PRODUKSI per PROJECT_STAGE_ROLE_ACCESS.
    expect(await canEditProjectStage("user-1", "proj-1", "PRA_PRODUKSI")).toBe(false);
  });

  it("allows a role that is allowed to edit the given stage", async () => {
    workspaceSettings.findUnique.mockResolvedValue({ id: 1, mode: "TIM" });
    projectRole.findMany.mockResolvedValue([
      { projectId: "proj-1", userId: "user-1", role: "TIM_PASCA_PRODUKSI" },
    ]);

    expect(await canEditProjectStage("user-1", "proj-1", "PASCA_PRODUKSI")).toBe(true);
    expect(await canEditProjectStage("user-1", "proj-1", "DISTRIBUSI")).toBe(true);
  });

  it("always allows LEADER_PRODUKSI_VIDEO regardless of stage", async () => {
    workspaceSettings.findUnique.mockResolvedValue({ id: 1, mode: "TIM" });
    projectRole.findMany.mockResolvedValue([
      { projectId: "proj-1", userId: "user-1", role: "LEADER_PRODUKSI_VIDEO" },
    ]);

    for (const stage of ["IDE", "PRA_PRODUKSI", "PRODUKSI", "PASCA_PRODUKSI", "DISTRIBUSI"] as const) {
      expect(await canEditProjectStage("user-1", "proj-1", stage)).toBe(true);
    }
  });
});

describe("canDeleteProject", () => {
  it("allows deleting when no workspace settings exist yet", async () => {
    workspaceSettings.findUnique.mockResolvedValue(null);

    expect(await canDeleteProject("user-1", "proj-1")).toBe(true);
  });

  it("allows deleting in Solo mode regardless of role", async () => {
    workspaceSettings.findUnique.mockResolvedValue({ id: 1, mode: "SOLO" });

    expect(await canDeleteProject("user-1", "proj-1")).toBe(true);
    expect(user.findUnique).not.toHaveBeenCalled();
    expect(projectRole.findFirst).not.toHaveBeenCalled();
  });

  it("allows a super admin regardless of project role", async () => {
    workspaceSettings.findUnique.mockResolvedValue({ id: 1, mode: "TIM" });
    user.findUnique.mockResolvedValue({ id: "user-1", isSuperAdmin: true });

    expect(await canDeleteProject("user-1", "proj-1")).toBe(true);
    expect(projectRole.findFirst).not.toHaveBeenCalled();
  });

  it("allows that project's Leader Produksi Video even without super admin", async () => {
    workspaceSettings.findUnique.mockResolvedValue({ id: 1, mode: "TIM" });
    user.findUnique.mockResolvedValue({ id: "user-1", isSuperAdmin: false });
    projectRole.findFirst.mockResolvedValue({
      projectId: "proj-1",
      userId: "user-1",
      role: "LEADER_PRODUKSI_VIDEO",
    });

    expect(await canDeleteProject("user-1", "proj-1")).toBe(true);
  });

  it("denies a non-super-admin who isn't that project's Leader Produksi Video", async () => {
    workspaceSettings.findUnique.mockResolvedValue({ id: 1, mode: "TIM" });
    user.findUnique.mockResolvedValue({ id: "user-1", isSuperAdmin: false });
    projectRole.findFirst.mockResolvedValue(null);

    expect(await canDeleteProject("user-1", "proj-1")).toBe(false);
  });

  it("denies a user holding another role (e.g. TIM_PRODUKSI) on the project", async () => {
    workspaceSettings.findUnique.mockResolvedValue({ id: 1, mode: "TIM" });
    user.findUnique.mockResolvedValue({ id: "user-1", isSuperAdmin: false });
    // findFirst is scoped to role: LEADER_PRODUKSI_VIDEO, so a TIM_PRODUKSI-only
    // user finds no matching row.
    projectRole.findFirst.mockResolvedValue(null);

    expect(await canDeleteProject("user-1", "proj-1")).toBe(false);
  });
});
