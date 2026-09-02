import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getWorkspaceSettings } from "@/lib/workspace-settings";
import { assignRoleAction, removeRoleAction } from "./actions";

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
    <main>
      <p>
        <Link href={`/episodes/${episodeId}`}>← {episode.title}</Link>
      </p>
      <h1>Peran Tim: {episode.title}</h1>

      <ul>
        {roles.map((assignment) => (
          <li key={assignment.id}>
            {assignment.user.name ?? assignment.user.email} — {ROLE_LABELS[assignment.role]}{" "}
            <form
              action={removeRoleAction.bind(null, episodeId, assignment.id)}
              style={{ display: "inline" }}
            >
              <button type="submit">Hapus</button>
            </form>
          </li>
        ))}
        {roles.length === 0 && (
          <p>Belum ada peran diberikan — semua anggota tim bisa mengedit semua tahap untuk episode ini.</p>
        )}
      </ul>

      <h2>Tambah Peran</h2>
      <form action={assignRoleAction.bind(null, episodeId)}>
        <div>
          <label htmlFor="userId">Anggota tim</label>
          <select id="userId" name="userId" required>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name ?? user.email}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="role">Peran</label>
          <select id="role" name="role" required>
            <option value="PRODUCER">Producer</option>
            <option value="HOST">Host</option>
            <option value="EDITOR">Editor</option>
          </select>
        </div>
        <button type="submit">Tambah</button>
      </form>
    </main>
  );
}
