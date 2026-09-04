import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { createTimestampMarkerAction, deleteTimestampMarkerAction } from "./actions";
import {
  BACK_LINK,
  BUTTON_DANGER,
  BUTTON_PRIMARY,
  BUTTON_SECONDARY,
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
    <main className={PAGE}>
      <p className="mb-2">
        <Link href={`/episodes/${episodeId}`} className={BACK_LINK}>
          ← {episode.title}
        </Link>
      </p>
      <h1 className={H1}>Timestamp/Chapter: {episode.title}</h1>

      <ul className={CARD_LIST}>
        {markers.map((marker) => (
          <li key={marker.id} className={`${CARD} flex items-center justify-between gap-3`}>
            <p className="text-sm text-slate-900">
              <strong className="font-medium">{marker.timeLabel}</strong> — {marker.label}
            </p>
            <div className="flex shrink-0 items-center gap-2">
              <Link
                href={`/episodes/${episodeId}/timestamps/${marker.id}/edit`}
                className={BUTTON_SECONDARY}
              >
                Edit
              </Link>
              <form action={deleteTimestampMarkerAction.bind(null, episodeId, marker.id)}>
                <button type="submit" className={BUTTON_DANGER}>
                  Hapus
                </button>
              </form>
            </div>
          </li>
        ))}
        {markers.length === 0 && <p className={EMPTY_STATE}>Belum ada timestamp/chapter.</p>}
      </ul>

      <h2 className={H2}>Tambah Timestamp</h2>
      <form action={createTimestampMarkerAction.bind(null, episodeId)} className={FORM}>
        <div className={FIELD_GROUP}>
          <label htmlFor="timeLabel" className={LABEL}>
            Waktu (mis. 00:12:34)
          </label>
          <input id="timeLabel" name="timeLabel" placeholder="00:00:00" required className={INPUT} />
        </div>
        <div className={FIELD_GROUP}>
          <label htmlFor="label" className={LABEL}>
            Label chapter
          </label>
          <input id="label" name="label" required className={INPUT} />
        </div>
        <button type="submit" className={BUTTON_PRIMARY}>
          Tambah
        </button>
      </form>
    </main>
  );
}
