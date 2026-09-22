import { EpisodeRoleType, EpisodeStage, ProjectRoleType, ProjectStage } from "@prisma/client";
import { prisma } from "./prisma";
import { requireSession, resolveUserId } from "./session";

// Which roles may edit each stage. This mapping is this project's own
// decision (PRD.md flagged issue #16 as needing one — not fully specified
// there), not something extracted from the PRD:
// - LEADER_PRODUKSI can edit every stage (acts as the episode's admin)
// - TIM_BRAINSTORMING covers ideation and outline prep — the stages before
//   there's anything to record
// - TIM_LIVE covers pre-production logistics and the live execution/rundown
// - TIM_EVALUASI covers everything after recording wraps: post-production,
//   publish, and evaluation
// - Everyone can still VIEW every stage read-only regardless of role,
//   per PRD.md User Story 26 — this helper only gates editing.
const STAGE_ROLE_ACCESS: Record<EpisodeStage, EpisodeRoleType[]> = {
  BANK_TEMA: ["LEADER_PRODUKSI", "TIM_BRAINSTORMING"],
  RISET_OUTLINE: ["LEADER_PRODUKSI", "TIM_BRAINSTORMING"],
  PRA_PRODUKSI: ["LEADER_PRODUKSI", "TIM_LIVE"],
  PANDUAN_EKSEKUSI: ["LEADER_PRODUKSI", "TIM_LIVE"],
  PASCA_PRODUKSI: ["LEADER_PRODUKSI", "TIM_EVALUASI"],
  PUBLISH_DISTRIBUSI: ["LEADER_PRODUKSI", "TIM_EVALUASI"],
  EVALUASI: ["LEADER_PRODUKSI", "TIM_EVALUASI"],
};

/**
 * Whether `userId` may edit `stage` on `episodeId`.
 *
 * In Solo mode this is always true (single user, no roles to check).
 *
 * In Tim mode: if the episode has no EpisodeRole rows configured at all
 * yet, this fails OPEN (returns true) rather than locking everyone out the
 * moment a workspace switches to Tim mode before anyone has been assigned
 * a role — this is an internal, trust-based tool, not a security boundary
 * against adversarial users. Once at least one role is configured on the
 * episode, only users holding an allowed role for that stage may edit.
 *
 */
export async function canEditStage(
  userId: string,
  episodeId: string,
  stage: EpisodeStage,
): Promise<boolean> {
  const settings = await prisma.workspaceSettings.findUnique({ where: { id: 1 } });
  if (!settings || settings.mode === "SOLO") return true;

  const roles = await prisma.episodeRole.findMany({ where: { episodeId } });
  if (roles.length === 0) return true;

  const userRoles = roles.filter((role) => role.userId === userId).map((role) => role.role);
  if (userRoles.length === 0) return false;

  const allowedRoles = STAGE_ROLE_ACCESS[stage];
  return userRoles.some((role) => allowedRoles.includes(role));
}

/**
 * Server-action guard combining requireSession() with canEditStage().
 * Redirects to /login if unauthenticated; throws a plain Error (consistent
 * with this codebase's existing validation-error convention, e.g.
 * "Judul wajib diisi.") if the logged-in user can't edit this stage.
 *
 * Not usable inside route handlers (requireSession() calls redirect(),
 * which only works in Server Components/Actions) — the note API route
 * checks canEditStage() directly instead.
 */
export async function requireEditableStage(episodeId: string, stage: EpisodeStage) {
  const session = await requireSession();
  const userId = await resolveUserId(session);
  if (!userId) {
    throw new Error("Sesi tidak valid, silakan login ulang.");
  }

  const allowed = await canEditStage(userId, episodeId, stage);
  if (!allowed) {
    throw new Error("Kamu tidak punya izin mengedit tahap ini.");
  }

  return session;
}

// --- Video production (Project) ---
//
// Mirrors the Episode role-gating above but for Project/ProjectRoleType,
// which has its own vocabulary (see prisma/schema.prisma). Content areas
// gate on the conceptual stage they belong to (e.g. Storyboard always
// gates on PRA_PRODUKSI), independent of the project's current `stage`
// field — the same design as STAGE_ROLE_ACCESS above.
const PROJECT_STAGE_ROLE_ACCESS: Record<ProjectStage, ProjectRoleType[]> = {
  IDE: ["LEADER_PRODUKSI_VIDEO", "TIM_PRA_PRODUKSI"],
  PRA_PRODUKSI: ["LEADER_PRODUKSI_VIDEO", "TIM_PRA_PRODUKSI"],
  PRODUKSI: ["LEADER_PRODUKSI_VIDEO", "TIM_PRODUKSI"],
  PASCA_PRODUKSI: ["LEADER_PRODUKSI_VIDEO", "TIM_PASCA_PRODUKSI"],
  // No dedicated "Tim Distribusi" role exists — deliverables and
  // post-release evaluation are treated as the post-production team's
  // responsibility, the same team that already owns the edit pipeline.
  DISTRIBUSI: ["LEADER_PRODUKSI_VIDEO", "TIM_PASCA_PRODUKSI"],
};

/** Project counterpart to canEditStage() — see its docs for the Solo/Tim/fail-open rules. */
export async function canEditProjectStage(
  userId: string,
  projectId: string,
  stage: ProjectStage,
): Promise<boolean> {
  const settings = await prisma.workspaceSettings.findUnique({ where: { id: 1 } });
  if (!settings || settings.mode === "SOLO") return true;

  const roles = await prisma.projectRole.findMany({ where: { projectId } });
  if (roles.length === 0) return true;

  const userRoles = roles.filter((role) => role.userId === userId).map((role) => role.role);
  if (userRoles.length === 0) return false;

  const allowedRoles = PROJECT_STAGE_ROLE_ACCESS[stage];
  return userRoles.some((role) => allowedRoles.includes(role));
}

/** Project counterpart to requireEditableStage() — see its docs. */
export async function requireEditableProjectStage(projectId: string, stage: ProjectStage) {
  const session = await requireSession();
  const userId = await resolveUserId(session);
  if (!userId) {
    throw new Error("Sesi tidak valid, silakan login ulang.");
  }

  const allowed = await canEditProjectStage(userId, projectId, stage);
  if (!allowed) {
    throw new Error("Kamu tidak punya izin mengedit tahap ini.");
  }

  return session;
}

/**
 * Whether `userId` may delete `projectId` — deliberately narrower than
 * canEditProjectStage(): only a super admin (User.isSuperAdmin, a global
 * override) or that specific project's Leader Produksi Video may delete
 * it, not the wider set of roles that may edit its stages.
 *
 * Same Solo-mode fail-open rule as canEditProjectStage() — Solo mode is a
 * single user with nothing to protect the project from.
 */
export async function canDeleteProject(userId: string, projectId: string): Promise<boolean> {
  const settings = await prisma.workspaceSettings.findUnique({ where: { id: 1 } });
  if (!settings || settings.mode === "SOLO") return true;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user?.isSuperAdmin) return true;

  const leaderRole = await prisma.projectRole.findFirst({
    where: { projectId, userId, role: "LEADER_PRODUKSI_VIDEO" },
  });
  return leaderRole !== null;
}

/** Server-action guard combining requireSession() with canDeleteProject(). */
export async function requireCanDeleteProject(projectId: string) {
  const session = await requireSession();
  const userId = await resolveUserId(session);
  if (!userId) {
    throw new Error("Sesi tidak valid, silakan login ulang.");
  }

  const allowed = await canDeleteProject(userId, projectId);
  if (!allowed) {
    throw new Error("Hanya Super Admin atau Leader Produksi project ini yang bisa menghapus proyek.");
  }

  return session;
}
