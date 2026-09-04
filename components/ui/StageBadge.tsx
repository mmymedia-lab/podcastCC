import { EpisodeStage } from "@prisma/client";
import { STAGE_LABELS } from "@/app/episodes/stages";

const STAGE_STYLE: Record<EpisodeStage, string> = {
  BANK_TEMA: "text-stage-bank-tema bg-stage-bank-tema-bg",
  RISET_OUTLINE: "text-stage-riset-outline bg-stage-riset-outline-bg",
  PRA_PRODUKSI: "text-stage-pra-produksi bg-stage-pra-produksi-bg",
  PANDUAN_EKSEKUSI: "text-stage-panduan-eksekusi bg-stage-panduan-eksekusi-bg",
  PASCA_PRODUKSI: "text-stage-pasca-produksi bg-stage-pasca-produksi-bg",
  PUBLISH_DISTRIBUSI: "text-stage-publish-distribusi bg-stage-publish-distribusi-bg",
  EVALUASI: "text-stage-evaluasi bg-stage-evaluasi-bg",
};

export function StageBadge({ stage }: { stage: EpisodeStage }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STAGE_STYLE[stage]}`}
    >
      {STAGE_LABELS[stage]}
    </span>
  );
}
