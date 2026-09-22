import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSession, resolveUserId } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getWorkspaceSettings } from "@/lib/workspace-settings";
import { canUnlockProjectPascaProduksi, getProjectPascaProduksiGate } from "@/lib/permissions";
import { STAGE_ORDER, STAGE_LABELS } from "../stages";
import {
  deleteProjectAction,
  lockProjectPascaProduksiAction,
  unlockProjectPascaProduksiAction,
  updateProjectStageAction,
} from "../actions";
import { ProjectStageBadge } from "@/components/ui/ProjectStageBadge";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { DriveFolderNotice } from "@/components/ui/DriveFolderNotice";
import { PascaProduksiGateNotice } from "@/components/ui/PascaProduksiGateNotice";
import { BUTTON_DANGER, BUTTON_PRIMARY, BUTTON_SECONDARY, CARD, H1, INPUT, LABEL, PAGE_WIDE } from "@/lib/ui-classes";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireSession();
  const { id } = await params;

  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) notFound();

  const settings = await getWorkspaceSettings();

  const userId = await resolveUserId(session);
  const pascaProduksiGate = await getProjectPascaProduksiGate(id);
  const canTogglePascaProduksi = userId ? await canUnlockProjectPascaProduksi(userId, id) : false;

  return (
    <main className={PAGE_WIDE}>
      <Breadcrumb
        items={[
          { label: "Beranda", href: "/dashboard" },
          { label: "Video", href: "/videos" },
          { label: project.title },
        ]}
      />
      <div className="mb-6">
        <h1 className={`${H1} mb-2`}>{project.title}</h1>
        <ProjectStageBadge stage={project.stage} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <form action={updateProjectStageAction.bind(null, project.id)} className={CARD}>
          <label htmlFor="stage" className={LABEL}>
            Ubah tahap
          </label>
          <select id="stage" name="stage" defaultValue={project.stage} className={`${INPUT} mb-3`}>
            {STAGE_ORDER.map((stage) => (
              <option key={stage} value={stage}>
                {STAGE_LABELS[stage]}
              </option>
            ))}
          </select>
          <button type="submit" className={BUTTON_PRIMARY}>
            Simpan
          </button>
        </form>

        <div className={CARD}>
          <p className="mb-3 text-sm font-medium text-slate-700">Pra-Produksi</p>
          <div className="flex flex-wrap gap-2">
            <Link href={`/videos/${project.id}/script-breakdown`} className={BUTTON_SECONDARY}>
              Script Breakdown
            </Link>
            <Link href={`/videos/${project.id}/storyboard`} className={BUTTON_SECONDARY}>
              Storyboard
            </Link>
            <Link href={`/videos/${project.id}/shot-list`} className={BUTTON_SECONDARY}>
              Shot List
            </Link>
          </div>
          <p className="mb-3 mt-4 text-sm font-medium text-slate-700">Produksi</p>
          <div className="flex flex-wrap gap-2">
            <Link href={`/videos/${project.id}/shooting-days`} className={BUTTON_SECONDARY}>
              Hari Syuting & Call Sheet
            </Link>
          </div>

          <p className="mb-3 mt-4 text-sm font-medium text-slate-700">Pasca-Produksi</p>
          <PascaProduksiGateNotice
            unlocked={pascaProduksiGate.unlocked}
            productionDate={pascaProduksiGate.productionDate}
            manualOverride={pascaProduksiGate.manualOverride}
            canToggle={canTogglePascaProduksi}
            unlockAction={unlockProjectPascaProduksiAction.bind(null, project.id)}
            lockAction={lockProjectPascaProduksiAction.bind(null, project.id)}
          />
          <div className="flex flex-wrap gap-2">
            <Link href={`/videos/${project.id}/edit-versions`} className={BUTTON_SECONDARY}>
              Edit Version & Revisi
            </Link>
          </div>

          <p className="mb-3 mt-4 text-sm font-medium text-slate-700">Distribusi & Evaluasi</p>
          <div className="flex flex-wrap gap-2">
            <Link href={`/videos/${project.id}/deliverables`} className={BUTTON_SECONDARY}>
              Deliverables
            </Link>
            <Link href={`/videos/${project.id}/evaluation`} className={BUTTON_SECONDARY}>
              Evaluasi Pasca-Tayang
            </Link>
            {settings.mode === "TIM" && (
              <Link href={`/videos/${project.id}/roles`} className={BUTTON_SECONDARY}>
                Peran Tim
              </Link>
            )}
          </div>

          <div className="mt-4">
            <DriveFolderNotice driveFolderUrl={project.driveFolderUrl} />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Link href={`/videos/${project.id}/edit`} className={BUTTON_SECONDARY}>
              Edit Judul
            </Link>
            <form action={deleteProjectAction.bind(null, project.id)}>
              <button type="submit" className={BUTTON_DANGER}>
                Hapus Proyek
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
