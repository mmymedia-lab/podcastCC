import { notFound } from "next/navigation";
import { requireSession, resolveUserId } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { canUnlockProjectPascaProduksi, getProjectPascaProduksiGate } from "@/lib/permissions";
import { deleteEditVersionAction, updateApprovalStatusAction } from "../actions";
import { createRevisionNoteAction, deleteRevisionNoteAction, toggleRevisionNoteResolvedAction } from "./actions";
import { lockProjectPascaProduksiAction, unlockProjectPascaProduksiAction } from "@/app/videos/actions";
import { APPROVAL_STATUS_LABELS, APPROVAL_STATUS_ORDER, EDIT_VERSION_STAGE_LABELS } from "../stages";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { PascaProduksiGateNotice } from "@/components/ui/PascaProduksiGateNotice";
import {
  BUTTON_DANGER,
  BUTTON_GHOST,
  BUTTON_PRIMARY,
  CARD,
  CARD_LIST,
  EMPTY_STATE,
  FIELD_GROUP,
  FORM,
  H1,
  INPUT,
  LABEL,
  PAGE_WIDE,
} from "@/lib/ui-classes";

export default async function EditVersionDetailPage({
  params,
}: {
  params: Promise<{ id: string; versionId: string }>;
}) {
  const session = await requireSession();
  const { id: projectId, versionId } = await params;

  const version = await prisma.editVersion.findUnique({ where: { id: versionId } });
  if (!version || version.projectId !== projectId) notFound();

  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) notFound();

  const notes = await prisma.revisionNote.findMany({
    where: { editVersionId: versionId },
    orderBy: { createdAt: "desc" },
  });

  const userId = await resolveUserId(session);
  const pascaProduksiGate = await getProjectPascaProduksiGate(projectId);
  const canTogglePascaProduksi = userId ? await canUnlockProjectPascaProduksi(userId, projectId) : false;
  const locked = !pascaProduksiGate.unlocked;

  return (
    <main className={PAGE_WIDE}>
      <Breadcrumb
        items={[
          { label: "Beranda", href: "/dashboard" },
          { label: "Video", href: "/videos" },
          { label: project.title, href: `/videos/${projectId}` },
          { label: "Edit Version", href: `/videos/${projectId}/edit-versions` },
          { label: EDIT_VERSION_STAGE_LABELS[version.stage] },
        ]}
      />
      <h1 className={H1}>{EDIT_VERSION_STAGE_LABELS[version.stage]}</h1>

      <PascaProduksiGateNotice
        unlocked={pascaProduksiGate.unlocked}
        productionDate={pascaProduksiGate.productionDate}
        manualOverride={pascaProduksiGate.manualOverride}
        canToggle={canTogglePascaProduksi}
        unlockAction={unlockProjectPascaProduksiAction.bind(null, projectId)}
        lockAction={lockProjectPascaProduksiAction.bind(null, projectId)}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className={CARD}>
          <p className="mb-2 text-sm font-medium text-slate-700">Link Cut</p>
          <a
            href={version.driveUrl}
            target="_blank"
            rel="noreferrer"
            className="block break-all text-sm text-primary-700 hover:underline"
          >
            {version.driveUrl}
          </a>

          <form
            action={updateApprovalStatusAction.bind(null, projectId, version.id)}
            className="mt-4"
          >
            <fieldset disabled={locked}>
              <label htmlFor="approvalStatus" className={LABEL}>
                Status Approval
              </label>
              <select
                id="approvalStatus"
                name="approvalStatus"
                defaultValue={version.approvalStatus}
                className={`${INPUT} mb-3`}
              >
                {APPROVAL_STATUS_ORDER.map((status) => (
                  <option key={status} value={status}>
                    {APPROVAL_STATUS_LABELS[status]}
                  </option>
                ))}
              </select>
              <button type="submit" className={BUTTON_PRIMARY}>
                Simpan
              </button>
            </fieldset>
          </form>

          <form action={deleteEditVersionAction.bind(null, projectId, version.id)} className="mt-4">
            <button type="submit" disabled={locked} className={BUTTON_DANGER}>
              Hapus Versi
            </button>
          </form>
        </div>

        <div className={CARD}>
          <p className="mb-3 text-sm font-medium text-slate-700">Catatan Revisi</p>
          <ul className={CARD_LIST}>
            {notes.map((note) => (
              <li
                key={note.id}
                className={`rounded-md border p-3 ${note.resolved ? "border-slate-200 bg-slate-50" : "border-slate-200"}`}
              >
                <p className={`text-sm ${note.resolved ? "text-slate-400 line-through" : "text-slate-900"}`}>
                  {note.content}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <form action={toggleRevisionNoteResolvedAction.bind(null, projectId, versionId, note.id)}>
                    <button type="submit" disabled={locked} className={BUTTON_GHOST}>
                      {note.resolved ? "Tandai Belum Selesai" : "Tandai Selesai"}
                    </button>
                  </form>
                  <form action={deleteRevisionNoteAction.bind(null, projectId, versionId, note.id)}>
                    <button type="submit" disabled={locked} className={BUTTON_DANGER}>
                      Hapus
                    </button>
                  </form>
                </div>
              </li>
            ))}
            {notes.length === 0 && <p className={EMPTY_STATE}>Belum ada catatan revisi.</p>}
          </ul>

          <form
            action={createRevisionNoteAction.bind(null, projectId, versionId)}
            className={`${FORM} mt-4`}
          >
            <fieldset disabled={locked}>
              <div className={FIELD_GROUP}>
                <label htmlFor="content" className={LABEL}>
                  Catatan Revisi
                </label>
                <input id="content" name="content" required className={INPUT} />
              </div>
              <button type="submit" className={BUTTON_PRIMARY}>
                Tambah
              </button>
            </fieldset>
          </form>
        </div>
      </div>
    </main>
  );
}
