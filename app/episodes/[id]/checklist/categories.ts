import { ChecklistCategory } from "@prisma/client";

export const CHECKLIST_CATEGORY_SLUGS: Record<string, ChecklistCategory> = {
  "pra-produksi": "PRE_PRODUCTION",
  "pasca-produksi": "POST_PRODUCTION",
  publish: "PUBLISH",
};

export const CHECKLIST_CATEGORY_LABELS: Record<ChecklistCategory, string> = {
  PRE_PRODUCTION: "Checklist Pra-Produksi",
  POST_PRODUCTION: "Checklist Pasca-Produksi",
  PUBLISH: "Checklist Publish & Distribusi",
};

export function slugToCategory(slug: string): ChecklistCategory | null {
  return CHECKLIST_CATEGORY_SLUGS[slug] ?? null;
}
