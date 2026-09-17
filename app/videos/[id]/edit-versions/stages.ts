import { EditApprovalStatus, EditVersionStage } from "@prisma/client";

export const EDIT_VERSION_STAGE_ORDER: EditVersionStage[] = ["ROUGH_CUT", "FINE_CUT", "PICTURE_LOCK"];

export const EDIT_VERSION_STAGE_LABELS: Record<EditVersionStage, string> = {
  ROUGH_CUT: "Rough Cut",
  FINE_CUT: "Fine Cut",
  PICTURE_LOCK: "Picture Lock",
};

export const APPROVAL_STATUS_ORDER: EditApprovalStatus[] = ["DRAFT", "IN_REVIEW", "APPROVED"];

export const APPROVAL_STATUS_LABELS: Record<EditApprovalStatus, string> = {
  DRAFT: "Draft",
  IN_REVIEW: "Sedang Direview",
  APPROVED: "Disetujui",
};
