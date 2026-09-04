import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getWorkspaceSettings } from "@/lib/workspace-settings";
import { assignRoleAction, removeRoleAction } from "./actions";
import {
  BACK_LINK,
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
  PRODUCER: "Producer",
  HOST: "Host",
  EDITOR: "Editor",
} as const;

export default async function EpisodeRolesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireSession();
  const { id: episodeId } = await params;

  const settings = await getWorkspaceSettings();
  if (settings.mode !== "TIM") {
    redirect(`/episodes/${episodeId}`);
  }

  const episode = await prisma.episode.findUnique({ where: { id: episodeId } });
  if (!episode) notFound();

  const [roles, users] = await Promise.all([
    prisma.episodeRole.findMany({
      where: { episodeId },
      include: { user: { select: { email: true, name: true } } },
      orderBy: { createdAt: "asc" },
    }),
    prisma.user.findMany({ select: { id: true, email: true, name: true }, orderBy: { email: "asc" } }),
  ]);

  return (
    <main className={PAGE}>
      <p className="mb-2">
        <Link href={`/episodes/${episodeId}`} className={BACK_LINK}>
          ← {episode.title}
        </Link>
      </p>
      <h1 className={H1}>Peran Tim: {episode.title}</h1>

      <ul className={CARD_LIST}>
        {roles.map((assignment) => (
          <li key={assignment.id} className={`${CARD} flex items-center justify-between gap-3`}>
            <p className="text-sm text-slate-900">
              {assignment.user.name ?? assignment.user.email}{" "}
              <span className="ml-1 inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                {ROLE_LABELS[assignment.role]}
              </span>
            </p>
            <form action={removeRoleAction.bind(null, episodeId, assignment.id)}>
              <button type="submit" className={BUTTON_DANGER}>
                Hapus
              </button>
            </form>
          </li>
        ))}
        {roles.length === 0 && (
          <p className={EMPTY_STATE}>
            Belum ada peran diberikan — semua anggota tim bisa mengedit semua tahap untuk episode ini.
          </p>
        )}
      </ul>

      <h2 className={H2}>Tambah Peran</h2>
      <form action={assignRoleAction.bind(null, episodeId)} className={FORM}>
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
            <option value="PRODUCER">Producer</option>
            <option value="HOST">Host</option>
            <option value="EDITOR">Editor</option>
          </select>
        </div>
        <button type="submit" className={BUTTON_PRIMARY}>
          Tambah
        </button>
      </form>
    </main>
  );
}
