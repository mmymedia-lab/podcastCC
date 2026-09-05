import { EpisodeStage } from "@prisma/client";

export type EpisodePhase = "PRA_PRODUKSI" | "PRODUKSI_LIVE" | "PASCA_PRODUKSI";

export const PHASE_ORDER: EpisodePhase[] = ["PRA_PRODUKSI", "PRODUKSI_LIVE", "PASCA_PRODUKSI"];

export const PHASE_LABELS: Record<EpisodePhase, string> = {
  PRA_PRODUKSI: "Pra-Produksi",
  PRODUKSI_LIVE: "Produksi/Live",
  PASCA_PRODUKSI: "Pasca-Produksi",
};

/** Which of the 3 broad phases each of the 7 PRD stages belongs to. */
export const STAGE_TO_PHASE: Record<EpisodeStage, EpisodePhase> = {
  BANK_TEMA: "PRA_PRODUKSI",
  RISET_OUTLINE: "PRA_PRODUKSI",
  PRA_PRODUKSI: "PRA_PRODUKSI",
  PANDUAN_EKSEKUSI: "PRODUKSI_LIVE",
  PASCA_PRODUKSI: "PASCA_PRODUKSI",
  PUBLISH_DISTRIBUSI: "PASCA_PRODUKSI",
  EVALUASI: "PASCA_PRODUKSI",
};

export const PHASE_DOT_STYLE: Record<EpisodePhase, string> = {
  PRA_PRODUKSI: "bg-phase-pra-produksi",
  PRODUKSI_LIVE: "bg-phase-produksi-live",
  PASCA_PRODUKSI: "bg-phase-pasca-produksi",
};

export const PHASE_BADGE_STYLE: Record<EpisodePhase, string> = {
  PRA_PRODUKSI: "text-phase-pra-produksi bg-phase-pra-produksi-bg",
  PRODUKSI_LIVE: "text-phase-produksi-live bg-phase-produksi-live-bg",
  PASCA_PRODUKSI: "text-phase-pasca-produksi bg-phase-pasca-produksi-bg",
};
