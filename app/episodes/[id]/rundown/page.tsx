import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import {
  createRundownSegmentAction,
  deleteRundownSegmentAction,
  moveRundownSegmentAction,
} from "./actions";

export default async function RundownPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireSession();
  const { id: episodeId } = await params;

  const episode = await prisma.episode.findUnique({ where: { id: episodeId } });
  if (!episode) notFound();

  const segments = await prisma.rundownSegment.findMany({
    where: { episodeId },
    orderBy: { order: "asc" },
  });

  return (
    <main>
      <p>
        <Link href={`/episodes/${episodeId}`}>← {episode.title}</Link>
      </p>
      <h1>Rundown: {episode.title}</h1>
      <p>
        <Link href={`/episodes/${episodeId}/execute`}>▶ Buka Mode Eksekusi (full-screen)</Link>
      </p>

      <ol>
        {segments.map((segment, index) => (
          <li key={segment.id}>
            <h2>{segment.title}</h2>
            <p>Estimasi: {segment.estimatedMinutes} menit</p>
            <p style={{ whiteSpace: "pre-wrap" }}>{segment.talkingPoints}</p>
            <form
              action={moveRundownSegmentAction.bind(null, episodeId, segment.id, "up")}
              style={{ display: "inline" }}
            >
              <button
                type="submit"
                disabled={index === 0}
                aria-label="Pindahkan segmen ke atas"
                style={{ minWidth: "2.5rem", minHeight: "2.5rem" }}
              >
                ↑
              </button>
            </form>
            <form
              action={moveRundownSegmentAction.bind(null, episodeId, segment.id, "down")}
              style={{ display: "inline" }}
            >
              <button
                type="submit"
                disabled={index === segments.length - 1}
                aria-label="Pindahkan segmen ke bawah"
                style={{ minWidth: "2.5rem", minHeight: "2.5rem" }}
              >
                ↓
              </button>
            </form>
            <Link href={`/episodes/${episodeId}/rundown/${segment.id}/edit`}>Edit</Link>
            <form
              action={deleteRundownSegmentAction.bind(null, episodeId, segment.id)}
              style={{ display: "inline" }}
            >
              <button type="submit">Hapus</button>
            </form>
          </li>
        ))}
        {segments.length === 0 && <p>Belum ada segmen rundown.</p>}
      </ol>

      <h2>Tambah Segmen</h2>
      <form action={createRundownSegmentAction.bind(null, episodeId)}>
        <div>
          <label htmlFor="title">Judul segmen</label>
          <input id="title" name="title" required />
        </div>
        <div>
          <label htmlFor="talkingPoints">Talking points</label>
          <textarea id="talkingPoints" name="talkingPoints" required />
        </div>
        <div>
          <label htmlFor="estimatedMinutes">Estimasi durasi (menit)</label>
          <input id="estimatedMinutes" name="estimatedMinutes" type="number" min={1} defaultValue={5} />
        </div>
        <button type="submit">Tambah</button>
      </form>
    </main>
  );
}
