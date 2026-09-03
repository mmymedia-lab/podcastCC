import { EpisodeRoleType, EpisodeStage } from "@prisma/client";
import { prisma } from "./prisma";
import { requireSession } from "./session";

// Which roles may edit each stage. This mapping is this project's own
// decision (PRD.md flagged issue #16 as needing one — not fully specified
// there), not something extracted from the PRD:
// - PRODUCER can edit every stage (acts as the episode's admin)
// - HOST covers the stages they actually run day-to-day: outline prep,
//   pre-production logistics, and the live execution/rundown
// - EDITOR covers post-production and publish
// - Everyone can still VIEW every stage read-only regardless of role,
//   per PRD.md User Story 26 — this helper only gates editing.
const STAGE_ROLE_ACCESS: Record<EpisodeStage, EpisodeRoleType[]> = {
  BANK_TEMA: ["PRODUCER", "HOST"],
  RISET_OUTLINE: ["PRODUCER", "HOST"],
  PRA_PRODUKSI: ["PRODUCER", "HOST"],
  PANDUAN_EKSEKUSI: ["PRODUCER", "HOST"],
  PASCA_PRODUKSI: ["PRODUCER", "EDITOR"],
  PUBLISH_DISTRIBUSI: ["PRODUCER", "EDITOR"],
  EVALUASI: ["PRODUCER", "HOST", "EDITOR"],
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
  const userId = session.user?.id;
  if (!userId) {
    throw new Error("Sesi tidak valid, silakan login ulang.");
  }

  const allowed = await canEditStage(userId, episodeId, stage);
  if (!allowed) {
    throw new Error("Kamu tidak punya izin mengedit tahap ini.");
  }

  return session;
}
