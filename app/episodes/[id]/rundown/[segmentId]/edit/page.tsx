import { notFound } from "next/navigation";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { updateRundownSegmentAction } from "../../actions";

export default async function EditRundownSegmentPage({
  params,
}: {
  params: Promise<{ id: string; segmentId: string }>;
}) {
  await requireSession();
  const { id: episodeId, segmentId } = await params;

  const segment = await prisma.rundownSegment.findUnique({ where: { id: segmentId } });
  if (!segment || segment.episodeId !== episodeId) notFound();

  return (
    <main>
      <h1>Edit Segmen Rundown</h1>
      <form action={updateRundownSegmentAction.bind(null, episodeId, segment.id)}>
        <div>
          <label htmlFor="title">Judul segmen</label>
          <input id="title" name="title" defaultValue={segment.title} required />
        </div>
        <div>
          <label htmlFor="talkingPoints">Talking points</label>
          <textarea
            id="talkingPoints"
            name="talkingPoints"
            defaultValue={segment.talkingPoints}
            required
          />
        </div>
        <div>
          <label htmlFor="estimatedMinutes">Estimasi durasi (menit)</label>
          <input
            id="estimatedMinutes"
            name="estimatedMinutes"
            type="number"
            min={1}
            defaultValue={segment.estimatedMinutes}
          />
        </div>
        <button type="submit">Simpan</button>
      </form>
    </main>
  );
}
