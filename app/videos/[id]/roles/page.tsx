import { notFound, redirect } from "next/navigation";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getWorkspaceSettings } from "@/lib/workspace-settings";
import { assignRoleAction, removeRoleAction } from "./actions";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import {
  BUTTON_DANGER,
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

const ROLE_LABELS = {
  LEADER_PRODUKSI_VIDEO: "Leader Produksi Video",
  TIM_PRA_PRODUKSI: "Tim Pra-Produksi",
  TIM_PRODUKSI: "Tim Produksi",
  TIM_PASCA_PRODUKSI: "Tim Pasca-Produksi",
} as const;

export default async function ProjectRolesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireSession();
  const { id: projectId } = await params;

  const settings = await getWorkspaceSettings();
  if (settings.mode !== "TIM") {
    redirect(`/videos/${projectId}`);
  }

  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) notFound();

  const [roles, users] = await Promise.all([
    prisma.projectRole.findMany({
      where: { projectId },
      include: { user: { select: { email: true, name: true } } },
      orderBy: { createdAt: "asc" },
    }),
    prisma.user.findMany({ select: { id: true, email: true, name: true }, orderBy: { email: "asc" } }),
  ]);

  return (
    <main className={PAGE}>
      <Breadcrumb
        items={[
          { label: "Beranda", href: "/dashboard" },
          { label: "Video", href: "/videos" },
          { label: project.title, href: `/videos/${projectId}` },
          { label: "Peran Tim" },
        ]}
      />
      <h1 className={H1}>Peran Tim: {project.title}</h1>

      <ul className={CARD_LIST}>
        {roles.map((assignment) => (
          <li key={assignment.id} className={`${CARD} flex items-center justify-between gap-3`}>
            <p className="text-sm text-slate-900">
              {assignment.user.name ?? assignment.user.email}{" "}
              <span className="ml-1 inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                {ROLE_LABELS[assignment.role]}
              </span>
            </p>
            <form action={removeRoleAction.bind(null, projectId, assignment.id)}>
              <button type="submit" className={BUTTON_DANGER}>
                Hapus
              </button>
            </form>
          </li>
        ))}
        {roles.length === 0 && (
          <p className={EMPTY_STATE}>
            Belum ada peran diberikan — semua anggota tim bisa mengedit semua tahap untuk proyek ini.
          </p>
        )}
      </ul>

      <h2 className={H2}>Tambah Peran</h2>
      <form action={assignRoleAction.bind(null, projectId)} className={FORM}>
        <div className={FIELD_GROUP}>
          <label htmlFor="userId" className={LABEL}>
            Anggota tim
          </label>
          <select id="userId" name="userId" required className={INPUT}>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name ?? user.email}
              </option>
            ))}
          </select>
        </div>
        <div className={FIELD_GROUP}>
          <label htmlFor="role" className={LABEL}>
            Peran
          </label>
          <select id="role" name="role" required className={INPUT}>
            <option value="LEADER_PRODUKSI_VIDEO">Leader Produksi Video</option>
            <option value="TIM_PRA_PRODUKSI">Tim Pra-Produksi</option>
            <option value="TIM_PRODUKSI">Tim Produksi</option>
            <option value="TIM_PASCA_PRODUKSI">Tim Pasca-Produksi</option>
          </select>
        </div>
        <button type="submit" className={BUTTON_PRIMARY}>
          Tambah
        </button>
      </form>
    </main>
  );
}
