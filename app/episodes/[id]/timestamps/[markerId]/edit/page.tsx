import { notFound } from "next/navigation";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { updateTimestampMarkerAction } from "../../actions";

export default async function EditTimestampMarkerPage({
  params,
}: {
  params: Promise<{ id: string; markerId: string }>;
}) {
  await requireSession();
  const { id: episodeId, markerId } = await params;

  const marker = await prisma.timestampMarker.findUnique({ where: { id: markerId } });
  if (!marker || marker.episodeId !== episodeId) notFound();

  return (
    <main>
      <h1>Edit Timestamp</h1>
      <form action={updateTimestampMarkerAction.bind(null, episodeId, marker.id)}>
        <div>
          <label htmlFor="timeLabel">Waktu</label>
          <input id="timeLabel" name="timeLabel" defaultValue={marker.timeLabel} required />
        </div>
        <div>
          <label htmlFor="label">Label chapter</label>
          <input id="label" name="label" defaultValue={marker.label} required />
        </div>
        <button type="submit">Simpan</button>
      </form>
    </main>
  );
}
