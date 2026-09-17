import { ProjectStage } from "@prisma/client";
import { STAGE_LABELS } from "@/app/videos/stages";
import { PHASE_BADGE_STYLE, STAGE_TO_PHASE } from "@/app/videos/phases";

export function ProjectStageBadge({ stage }: { stage: ProjectStage }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${PHASE_BADGE_STYLE[STAGE_TO_PHASE[stage]]}`}
    >
      {STAGE_LABELS[stage]}
    </span>
  );
}
