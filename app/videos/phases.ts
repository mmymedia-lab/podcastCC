import { ProjectStage } from "@prisma/client";
import { PHASE_BADGE_STYLE, PHASE_BORDER_STYLE } from "@/app/episodes/phases";

// Reuses Episode's 3-phase color system (see app/episodes/phases.ts)
// instead of inventing a second palette — Project's 5 stages map onto the
// same Pra-Produksi/Produksi-Live/Pasca-Produksi buckets Episode already
// uses, just with a different stage vocabulary. Re-exporting the style
// maps (not just importing them where needed) keeps every Project-side
// import going through this one file, same as Episode's own phases.ts.
export type ProjectPhase = "PRA_PRODUKSI" | "PRODUKSI_LIVE" | "PASCA_PRODUKSI";

export const STAGE_TO_PHASE: Record<ProjectStage, ProjectPhase> = {
  IDE: "PRA_PRODUKSI",
  PRA_PRODUKSI: "PRA_PRODUKSI",
  PRODUKSI: "PRODUKSI_LIVE",
  PASCA_PRODUKSI: "PASCA_PRODUKSI",
  DISTRIBUSI: "PASCA_PRODUKSI",
};

export { PHASE_BADGE_STYLE, PHASE_BORDER_STYLE };
