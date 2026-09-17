import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { createEditVersionAction } from "./actions";
import { EDIT_VERSION_STAGE_LABELS, EDIT_VERSION_STAGE_ORDER } from "./stages";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import {
  BUTTON_PRIMARY,
  CARD,
  CARD_LIST,
  EMPTY_STATE,
  FIELD_GROUP,
  FORM,
  H1,
  H2,
  INPUT,
  LABEL,
  PAGE,
} from "@/lib/ui-classes";

const APPROVAL_BADGE_STYLE: Record<string, string> = {
  DRAFT: "bg-slate-100 text-slate-600",
  IN_REVIEW: "bg-amber-100 text-amber-700",
  APPROVED: "bg-emerald-100 text-emerald-700",
};

export default async function EditVersionsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireSession();
  const { id: projectId } = await params;

  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) notFound();

  const versions = await prisma.editVersion.findMany({
    where: { projectId },
    orderBy: { order: "asc" },
    include: { _count: { select: { revisionNotes: true } } },
  });

  return (
    <main className={PAGE}>
      <Breadcrumb
        items={[
          { label: "Beranda", href: "/dashboard" },
          { label: "Video", href: "/videos" },
          { label: project.title, href: `/videos/${projectId}` },
          { label: "Edit Version" },
        ]}
      />
      <h1 className={H1}>Edit Version: {project.title}</h1>

      <ol className={CARD_LIST}>
        {versions.map((version, index) => (
          <li key={version.id}>
            <Link
              href={`/videos/${projectId}/edit-versions/${version.id}`}
              className={`${CARD} block transition-shadow hover:shadow-md`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium text-slate-900">
                  Versi {index + 1}: {EDIT_VERSION_STAGE_LABELS[version.stage]}
                </p>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${APPROVAL_BADGE_STYLE[version.approvalStatus]}`}
                >
                  {version.approvalStatus === "DRAFT" && "Draft"}
                  {version.approvalStatus === "IN_REVIEW" && "Sedang Direview"}
                  {version.approvalStatus === "APPROVED" && "Disetujui"}
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-500">
                {version._count.revisionNotes} catatan revisi
              </p>
            </Link>
          </li>
        ))}
        {versions.length === 0 && <p className={EMPTY_STATE}>Belum ada versi edit.</p>}
      </ol>

      <h2 className={H2}>Tambah Versi</h2>
      <form action={createEditVersionAction.bind(null, projectId)} className={FORM}>
        <div className={FIELD_GROUP}>
          <label htmlFor="stage" className={LABEL}>
            Tahap
          </label>
          <select id="stage" name="stage" required className={INPUT}>
            {EDIT_VERSION_STAGE_ORDER.map((stage) => (
              <option key={stage} value={stage}>
                {EDIT_VERSION_STAGE_LABELS[stage]}
              </option>
            ))}
          </select>
        </div>
        <div className={FIELD_GROUP}>
          <label htmlFor="driveUrl" className={LABEL}>
            Link Google Drive
          </label>
          <input
            id="driveUrl"
            name="driveUrl"
            type="url"
            placeholder="https://drive.google.com/..."
            required
            className={INPUT}
          />
        </div>
        <button type="submit" className={BUTTON_PRIMARY}>
          Tambah
        </button>
      </form>
    </main>
  );
}
