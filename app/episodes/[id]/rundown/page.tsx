import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import {
  createRundownSegmentAction,
  deleteRundownSegmentAction,
  moveRundownSegmentAction,
} from "./actions";
import {
  BACK_LINK,
  BUTTON_DANGER,
  BUTTON_GHOST,
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
  TEXTAREA,
} from "@/lib/ui-classes";

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
    <main className={PAGE}>
      <p className="mb-2">
        <Link href={`/episodes/${episodeId}`} className={BACK_LINK}>
          ← {episode.title}
        </Link>
      </p>
      <div className="mb-6 flex items-center justify-between">
        <h1 className={`${H1} mb-0`}>Rundown: {episode.title}</h1>
        <Link href={`/episodes/${episodeId}/execute`} className={BUTTON_PRIMARY}>
          ▶ Buka Mode Eksekusi
        </Link>
      </div>

      <ol className={CARD_LIST}>
        {segments.map((segment, index) => (
          <li key={segment.id} className={CARD}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <h2 className="font-medium text-slate-900">{segment.title}</h2>
                <p className="mt-1 text-sm text-slate-500">Estimasi: {segment.estimatedMinutes} menit</p>
                <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">{segment.talkingPoints}</p>
              </div>
              <div className="flex flex-col gap-1">
                <form action={moveRundownSegmentAction.bind(null, episodeId, segment.id, "up")}>
                  <button
                    type="submit"
                    disabled={index === 0}
                    aria-label="Pindahkan segmen ke atas"
                    className={`${BUTTON_GHOST} disabled:opacity-40`}
                  >
                    ↑
                  </button>
                </form>
                <form action={moveRundownSegmentAction.bind(null, episodeId, segment.id, "down")}>
                  <button
                    type="submit"
                    disabled={index === segments.length - 1}
                    aria-label="Pindahkan segmen ke bawah"
                    className={`${BUTTON_GHOST} disabled:opacity-40`}
                  >
                    ↓
                  </button>
                </form>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Link href={`/episodes/${episodeId}/rundown/${segment.id}/edit`} className={BUTTON_SECONDARY}>
                Edit
              </Link>
              <form action={deleteRundownSegmentAction.bind(null, episodeId, segment.id)}>
                <button type="submit" className={BUTTON_DANGER}>
                  Hapus
                </button>
              </form>
            </div>
          </li>
        ))}
        {segments.length === 0 && <p className={EMPTY_STATE}>Belum ada segmen rundown.</p>}
      </ol>

      <h2 className={H2}>Tambah Segmen</h2>
      <form action={createRundownSegmentAction.bind(null, episodeId)} className={FORM}>
        <div className={FIELD_GROUP}>
          <label htmlFor="title" className={LABEL}>
            Judul segmen
          </label>
          <input id="title" name="title" required className={INPUT} />
        </div>
        <div className={FIELD_GROUP}>
          <label htmlFor="talkingPoints" className={LABEL}>
            Talking points
          </label>
          <textarea id="talkingPoints" name="talkingPoints" required className={TEXTAREA} />
        </div>
        <div className={FIELD_GROUP}>
          <label htmlFor="estimatedMinutes" className={LABEL}>
            Estimasi durasi (menit)
          </label>
          <input
            id="estimatedMinutes"
            name="estimatedMinutes"
            type="number"
            min={1}
            defaultValue={5}
            className={INPUT}
          />
        </div>
        <button type="submit" className={BUTTON_PRIMARY}>
          Tambah
        </button>
      </form>
    </main>
  );
}
