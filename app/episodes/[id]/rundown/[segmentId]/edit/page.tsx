import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { updateRundownSegmentAction } from "../../actions";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import {
  BUTTON_PRIMARY,
  BUTTON_SECONDARY,
  FIELD_GROUP,
  FORM,
  H1,
  INPUT,
  LABEL,
  PAGE,
  TEXTAREA,
} from "@/lib/ui-classes";

export default async function EditRundownSegmentPage({
  params,
}: {
  params: Promise<{ id: string; segmentId: string }>;
}) {
  await requireSession();
  const { id: episodeId, segmentId } = await params;

  const segment = await prisma.rundownSegment.findUnique({ where: { id: segmentId } });
  if (!segment || segment.episodeId !== episodeId) notFound();

  const episode = await prisma.episode.findUnique({ where: { id: episodeId } });
  if (!episode) notFound();

  return (
    <main className={PAGE}>
      <Breadcrumb
        items={[
          { label: "Beranda", href: "/dashboard" },
          { label: "Episode", href: "/episodes" },
          { label: episode.title, href: `/episodes/${episodeId}` },
          { label: "Rundown & Mode Eksekusi", href: `/episodes/${episodeId}/rundown` },
          { label: "Edit Segmen" },
        ]}
      />
      <h1 className={H1}>Edit Segmen Rundown</h1>
      <form action={updateRundownSegmentAction.bind(null, episodeId, segment.id)} className={FORM}>
        <div className={FIELD_GROUP}>
          <label htmlFor="title" className={LABEL}>
            Judul segmen
          </label>
          <input id="title" name="title" defaultValue={segment.title} required className={INPUT} />
        </div>
        <div className={FIELD_GROUP}>
          <label htmlFor="talkingPoints" className={LABEL}>
            Talking points
          </label>
          <textarea
            id="talkingPoints"
            name="talkingPoints"
            defaultValue={segment.talkingPoints}
            required
            className={TEXTAREA}
          />
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
            defaultValue={segment.estimatedMinutes}
            className={INPUT}
          />
        </div>
        <div className="flex gap-2">
          <button type="submit" className={BUTTON_PRIMARY}>
            Simpan
          </button>
          <Link href={`/episodes/${episodeId}/rundown`} className={BUTTON_SECONDARY}>
            Batal
          </Link>
        </div>
      </form>
    </main>
  );
}
