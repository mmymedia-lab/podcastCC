import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { createTimestampMarkerAction, deleteTimestampMarkerAction } from "./actions";

export default async function TimestampsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireSession();
  const { id: episodeId } = await params;

  const episode = await prisma.episode.findUnique({ where: { id: episodeId } });
  if (!episode) notFound();

  const markers = await prisma.timestampMarker.findMany({
    where: { episodeId },
    orderBy: { createdAt: "asc" },
  });

  return (
    <main>
      <p>
        <Link href={`/episodes/${episodeId}`}>← {episode.title}</Link>
      </p>
      <h1>Timestamp/Chapter: {episode.title}</h1>

      <ul>
        {markers.map((marker) => (
          <li key={marker.id}>
            <strong>{marker.timeLabel}</strong> — {marker.label}{" "}
            <Link href={`/episodes/${episodeId}/timestamps/${marker.id}/edit`}>Edit</Link>{" "}
            <form
              action={deleteTimestampMarkerAction.bind(null, episodeId, marker.id)}
              style={{ display: "inline" }}
            >
              <button type="submit">Hapus</button>
            </form>
          </li>
        ))}
        {markers.length === 0 && <p>Belum ada timestamp/chapter.</p>}
      </ul>

      <h2>Tambah Timestamp</h2>
      <form action={createTimestampMarkerAction.bind(null, episodeId)}>
        <div>
          <label htmlFor="timeLabel">Waktu (mis. 00:12:34)</label>
          <input id="timeLabel" name="timeLabel" placeholder="00:00:00" required />
        </div>
        <div>
          <label htmlFor="label">Label chapter</label>
          <input id="label" name="label" required />
        </div>
        <button type="submit">Tambah</button>
      </form>
    </main>
  );
}
