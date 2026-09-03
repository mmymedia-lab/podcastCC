import { notFound } from "next/navigation";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { updateTimestampMarkerAction } from "../../actions";
import { BUTTON_PRIMARY, FIELD_GROUP, FORM, H1, INPUT, LABEL, PAGE } from "@/lib/ui-classes";

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
    <main className={PAGE}>
      <h1 className={H1}>Edit Timestamp</h1>
      <form action={updateTimestampMarkerAction.bind(null, episodeId, marker.id)} className={FORM}>
        <div className={FIELD_GROUP}>
          <label htmlFor="timeLabel" className={LABEL}>
            Waktu
          </label>
          <input
            id="timeLabel"
            name="timeLabel"
            defaultValue={marker.timeLabel}
            required
            className={INPUT}
          />
        </div>
        <div className={FIELD_GROUP}>
          <label htmlFor="label" className={LABEL}>
            Label chapter
          </label>
          <input id="label" name="label" defaultValue={marker.label} required className={INPUT} />
        </div>
        <button type="submit" className={BUTTON_PRIMARY}>
          Simpan
        </button>
      </form>
    </main>
  );
}
