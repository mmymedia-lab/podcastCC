import { EpisodeStage } from "@prisma/client";

export const STAGE_ORDER: EpisodeStage[] = [
  "BANK_TEMA",
  "RISET_OUTLINE",
  "PRA_PRODUKSI",
  "PANDUAN_EKSEKUSI",
  "PASCA_PRODUKSI",
  "PUBLISH_DISTRIBUSI",
  "EVALUASI",
];

export const STAGE_LABELS: Record<EpisodeStage, string> = {
  BANK_TEMA: "Bank Tema",
  RISET_OUTLINE: "Riset & Outline",
  PRA_PRODUKSI: "Pra-Produksi",
  PANDUAN_EKSEKUSI: "Panduan Eksekusi",
  PASCA_PRODUKSI: "Pasca-Produksi",
  PUBLISH_DISTRIBUSI: "Publish & Distribusi",
  EVALUASI: "Evaluasi",
};
