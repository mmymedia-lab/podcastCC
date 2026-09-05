import { EpisodeStage } from "@prisma/client";
import { STAGE_LABELS } from "@/app/episodes/stages";
import { PHASE_BADGE_STYLE, STAGE_TO_PHASE } from "@/app/episodes/phases";

export function StageBadge({ stage }: { stage: EpisodeStage }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${PHASE_BADGE_STYLE[STAGE_TO_PHASE[stage]]}`}
    >
      {STAGE_LABELS[stage]}
    </span>
  );
}
