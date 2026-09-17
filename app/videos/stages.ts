import { ProjectStage } from "@prisma/client";

export const STAGE_ORDER: ProjectStage[] = [
  "IDE",
  "PRA_PRODUKSI",
  "PRODUKSI",
  "PASCA_PRODUKSI",
  "DISTRIBUSI",
];

export const STAGE_LABELS: Record<ProjectStage, string> = {
  IDE: "Ide",
  PRA_PRODUKSI: "Pra-Produksi",
  PRODUKSI: "Produksi",
  PASCA_PRODUKSI: "Pasca-Produksi",
  DISTRIBUSI: "Distribusi",
};
