import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./prisma", () => ({
  prisma: {
    workspaceSettings: { findUnique: vi.fn() },
    episodeRole: { findMany: vi.fn(), findFirst: vi.fn() },
    projectRole: { findMany: vi.fn(), findFirst: vi.fn() },
    user: { findUnique: vi.fn() },
    episode: { findUnique: vi.fn() },
    project: { findUnique: vi.fn() },
    shootingDay: { findFirst: vi.fn() },
  },
}));

import { prisma } from "./prisma";
import {
  canDeleteProject,
  canEditProjectStage,
  canEditStage,
  canUnlockEpisodePascaProduksi,
  canUnlockProjectPascaProduksi,
  getEpisodePascaProduksiGate,
  getProjectPascaProduksiGate,
} from "./permissions";

const workspaceSettings = prisma.workspaceSettings as unknown as { findUnique: ReturnType<typeof vi.fn> };
const episodeRole = prisma.episodeRole as unknown as {
  findMany: ReturnType<typeof vi.fn>;
  findFirst: ReturnType<typeof vi.fn>;
};
const projectRole = prisma.projectRole as unknown as {
  findMany: ReturnType<typeof vi.fn>;
  findFirst: ReturnType<typeof vi.fn>;
};
const user = prisma.user as unknown as { findUnique: ReturnType<typeof vi.fn> };
const episode = prisma.episode as unknown as { findUnique: ReturnType<typeof vi.fn> };
const project = prisma.project as unknown as { findUnique: ReturnType<typeof vi.fn> };
const shootingDay = prisma.shootingDay as unknown as { findFirst: ReturnType<typeof vi.fn> };

beforeEach(() => {
  workspaceSettings.findUnique.mockReset();
  episodeRole.findMany.mockReset();
  episodeRole.findFirst.mockReset();
  projectRole.findMany.mockReset();
  projectRole.findFirst.mockReset();
  user.findUnique.mockReset();

  // Default every Pasca-Produksi date-gate lookup to "manually unlocked" so
  // existing role-focused tests below (including ones that loop over every
  // stage, PASCA_PRODUKSI included) don't have to know about the gate —
  // the gate's own behavior is covered by its dedicated describe blocks,
  // which override these mocks per case.
  episode.findUnique.mockReset().mockResolvedValue({ recordingScheduledAt: null, pascaProduksiUnlocked: true });
  project.findUnique.mockReset().mockResolvedValue({ pascaProduksiUnlocked: true });
  shootingDay.findFirst.mockReset().mockResolvedValue(null);
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

function daysFromNow(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

describe("getEpisodePascaProduksiGate", () => {
  it("is unlocked when manually overridden, regardless of date", async () => {
    episode.findUnique.mockResolvedValue({
      recordingScheduledAt: daysFromNow(5),
      pascaProduksiUnlocked: true,
    });

    const gate = await getEpisodePascaProduksiGate("ep-1");
    expect(gate.unlocked).toBe(true);
    expect(gate.manualOverride).toBe(true);
  });

  it("is locked when the recording date is in the future and not overridden", async () => {
    episode.findUnique.mockResolvedValue({
      recordingScheduledAt: daysFromNow(3),
      pascaProduksiUnlocked: false,
    });

    const gate = await getEpisodePascaProduksiGate("ep-1");
    expect(gate.unlocked).toBe(false);
  });

  it("is unlocked once the recording date is today or in the past", async () => {
    episode.findUnique.mockResolvedValue({
      recordingScheduledAt: daysFromNow(0),
      pascaProduksiUnlocked: false,
    });
    expect((await getEpisodePascaProduksiGate("ep-1")).unlocked).toBe(true);

    episode.findUnique.mockResolvedValue({
      recordingScheduledAt: daysFromNow(-2),
      pascaProduksiUnlocked: false,
    });
    expect((await getEpisodePascaProduksiGate("ep-1")).unlocked).toBe(true);
  });

  it("is locked when no recording date is set at all and not overridden", async () => {
    episode.findUnique.mockResolvedValue({ recordingScheduledAt: null, pascaProduksiUnlocked: false });

    expect((await getEpisodePascaProduksiGate("ep-1")).unlocked).toBe(false);
  });
});

describe("getProjectPascaProduksiGate", () => {
  it("uses the latest Shooting Day's date as the production date", async () => {
    project.findUnique.mockResolvedValue({ pascaProduksiUnlocked: false });
    shootingDay.findFirst.mockResolvedValue({ scheduledDate: daysFromNow(-1) });

    const gate = await getProjectPascaProduksiGate("proj-1");
    expect(gate.unlocked).toBe(true);
    expect(shootingDay.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { scheduledDate: "desc" } }),
    );
  });

  it("is locked when the latest Shooting Day is still in the future", async () => {
    project.findUnique.mockResolvedValue({ pascaProduksiUnlocked: false });
    shootingDay.findFirst.mockResolvedValue({ scheduledDate: daysFromNow(2) });

    expect((await getProjectPascaProduksiGate("proj-1")).unlocked).toBe(false);
  });

  it("is unlocked when manually overridden even with no Shooting Day at all", async () => {
    project.findUnique.mockResolvedValue({ pascaProduksiUnlocked: true });
    shootingDay.findFirst.mockResolvedValue(null);

    expect((await getProjectPascaProduksiGate("proj-1")).unlocked).toBe(true);
  });

  it("is locked with no Shooting Day and no override", async () => {
    project.findUnique.mockResolvedValue({ pascaProduksiUnlocked: false });
    shootingDay.findFirst.mockResolvedValue(null);

    expect((await getProjectPascaProduksiGate("proj-1")).unlocked).toBe(false);
  });
});

describe("canEditStage — Pasca-Produksi date gate", () => {
  it("denies editing PASCA_PRODUKSI when locked, even for LEADER_PRODUKSI", async () => {
    episode.findUnique.mockResolvedValue({
      recordingScheduledAt: daysFromNow(3),
      pascaProduksiUnlocked: false,
    });
    workspaceSettings.findUnique.mockResolvedValue({ id: 1, mode: "TIM" });
    episodeRole.findMany.mockResolvedValue([
      { episodeId: "ep-1", userId: "user-1", role: "LEADER_PRODUKSI" },
    ]);

    expect(await canEditStage("user-1", "ep-1", "PASCA_PRODUKSI")).toBe(false);
  });

  it("denies editing PASCA_PRODUKSI when locked, even in Solo mode", async () => {
    episode.findUnique.mockResolvedValue({ recordingScheduledAt: null, pascaProduksiUnlocked: false });
    workspaceSettings.findUnique.mockResolvedValue({ id: 1, mode: "SOLO" });

    expect(await canEditStage("user-1", "ep-1", "PASCA_PRODUKSI")).toBe(false);
  });

  it("allows editing PASCA_PRODUKSI once unlocked, subject to the usual role check", async () => {
    episode.findUnique.mockResolvedValue({
      recordingScheduledAt: daysFromNow(-1),
      pascaProduksiUnlocked: false,
    });
    workspaceSettings.findUnique.mockResolvedValue({ id: 1, mode: "TIM" });
    episodeRole.findMany.mockResolvedValue([
      { episodeId: "ep-1", userId: "user-1", role: "TIM_EVALUASI" },
    ]);

    expect(await canEditStage("user-1", "ep-1", "PASCA_PRODUKSI")).toBe(true);
  });

  it("doesn't apply the date gate to other stages", async () => {
    episode.findUnique.mockResolvedValue({ recordingScheduledAt: null, pascaProduksiUnlocked: false });
    workspaceSettings.findUnique.mockResolvedValue({ id: 1, mode: "SOLO" });

    expect(await canEditStage("user-1", "ep-1", "RISET_OUTLINE")).toBe(true);
  });
});

describe("canEditProjectStage — Pasca-Produksi date gate", () => {
  it("denies editing PASCA_PRODUKSI when locked, even in Solo mode", async () => {
    project.findUnique.mockResolvedValue({ pascaProduksiUnlocked: false });
    shootingDay.findFirst.mockResolvedValue({ scheduledDate: daysFromNow(1) });
    workspaceSettings.findUnique.mockResolvedValue({ id: 1, mode: "SOLO" });

    expect(await canEditProjectStage("user-1", "proj-1", "PASCA_PRODUKSI")).toBe(false);
  });

  it("allows editing PASCA_PRODUKSI once the latest Shooting Day has passed", async () => {
    project.findUnique.mockResolvedValue({ pascaProduksiUnlocked: false });
    shootingDay.findFirst.mockResolvedValue({ scheduledDate: daysFromNow(-1) });
    workspaceSettings.findUnique.mockResolvedValue({ id: 1, mode: "SOLO" });

    expect(await canEditProjectStage("user-1", "proj-1", "PASCA_PRODUKSI")).toBe(true);
  });
});

describe("canUnlockEpisodePascaProduksi", () => {
  it("allows in Solo mode regardless of role", async () => {
    workspaceSettings.findUnique.mockResolvedValue({ id: 1, mode: "SOLO" });

    expect(await canUnlockEpisodePascaProduksi("user-1", "ep-1")).toBe(true);
    expect(user.findUnique).not.toHaveBeenCalled();
  });

  it("allows a super admin regardless of episode role", async () => {
    workspaceSettings.findUnique.mockResolvedValue({ id: 1, mode: "TIM" });
    user.findUnique.mockResolvedValue({ id: "user-1", isSuperAdmin: true });

    expect(await canUnlockEpisodePascaProduksi("user-1", "ep-1")).toBe(true);
    expect(episodeRole.findFirst).not.toHaveBeenCalled();
  });

  it("allows that episode's Leader Produksi", async () => {
    workspaceSettings.findUnique.mockResolvedValue({ id: 1, mode: "TIM" });
    user.findUnique.mockResolvedValue({ id: "user-1", isSuperAdmin: false });
    episodeRole.findFirst.mockResolvedValue({ episodeId: "ep-1", userId: "user-1", role: "LEADER_PRODUKSI" });

    expect(await canUnlockEpisodePascaProduksi("user-1", "ep-1")).toBe(true);
  });

  it("denies a non-super-admin who isn't that episode's Leader Produksi", async () => {
    workspaceSettings.findUnique.mockResolvedValue({ id: 1, mode: "TIM" });
    user.findUnique.mockResolvedValue({ id: "user-1", isSuperAdmin: false });
    episodeRole.findFirst.mockResolvedValue(null);

    expect(await canUnlockEpisodePascaProduksi("user-1", "ep-1")).toBe(false);
  });
});

describe("canUnlockProjectPascaProduksi", () => {
  it("allows in Solo mode regardless of role", async () => {
    workspaceSettings.findUnique.mockResolvedValue({ id: 1, mode: "SOLO" });

    expect(await canUnlockProjectPascaProduksi("user-1", "proj-1")).toBe(true);
    expect(user.findUnique).not.toHaveBeenCalled();
  });

  it("allows a super admin regardless of project role", async () => {
    workspaceSettings.findUnique.mockResolvedValue({ id: 1, mode: "TIM" });
    user.findUnique.mockResolvedValue({ id: "user-1", isSuperAdmin: true });

    expect(await canUnlockProjectPascaProduksi("user-1", "proj-1")).toBe(true);
    expect(projectRole.findFirst).not.toHaveBeenCalled();
  });

  it("allows that project's Leader Produksi Video", async () => {
    workspaceSettings.findUnique.mockResolvedValue({ id: 1, mode: "TIM" });
    user.findUnique.mockResolvedValue({ id: "user-1", isSuperAdmin: false });
    projectRole.findFirst.mockResolvedValue({
      projectId: "proj-1",
      userId: "user-1",
      role: "LEADER_PRODUKSI_VIDEO",
    });

    expect(await canUnlockProjectPascaProduksi("user-1", "proj-1")).toBe(true);
  });

  it("denies a non-super-admin who isn't that project's Leader Produksi Video", async () => {
    workspaceSettings.findUnique.mockResolvedValue({ id: 1, mode: "TIM" });
    user.findUnique.mockResolvedValue({ id: "user-1", isSuperAdmin: false });
    projectRole.findFirst.mockResolvedValue(null);

    expect(await canUnlockProjectPascaProduksi("user-1", "proj-1")).toBe(false);
  });
});
