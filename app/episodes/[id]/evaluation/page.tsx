import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import {
  convertNoteToThemeIdeaAction,
  createEvaluationNoteAction,
  deleteEvaluationNoteAction,
} from "./actions";

export default async function EvaluationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireSession();
  const { id: episodeId } = await params;

  const episode = await prisma.episode.findUnique({ where: { id: episodeId } });
  if (!episode) notFound();

  const notes = await prisma.evaluationNote.findMany({
    where: { episodeId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main>
      <p>
        <Link href={`/episodes/${episodeId}`}>← {episode.title}</Link>
      </p>
      <h1>Evaluasi: {episode.title}</h1>

      <ul>
        {notes.map((note) => (
          <li key={note.id}>
            <p style={{ whiteSpace: "pre-wrap" }}>{note.content}</p>
            {note.convertedToThemeIdeaAt ? (
              <span>✓ Sudah dijadikan ide</span>
            ) : (
              <form
                action={convertNoteToThemeIdeaAction.bind(null, episodeId, note.id)}
                style={{ display: "inline" }}
              >
                <button type="submit">Jadikan ide baru</button>
              </form>
            )}{" "}
            <form
              action={deleteEvaluationNoteAction.bind(null, episodeId, note.id)}
              style={{ display: "inline" }}
            >
              <button type="submit">Hapus</button>
            </form>
          </li>
        ))}
        {notes.length === 0 && <p>Belum ada catatan evaluasi.</p>}
      </ul>

      <h2>Tambah Catatan</h2>
      <form action={createEvaluationNoteAction.bind(null, episodeId)}>
        <div>
          <label htmlFor="content">Catatan (apa yang berjalan baik/kurang, ide follow-up, dll.)</label>
          <textarea id="content" name="content" required />
        </div>
        <button type="submit">Tambah</button>
      </form>
    </main>
  );
}
