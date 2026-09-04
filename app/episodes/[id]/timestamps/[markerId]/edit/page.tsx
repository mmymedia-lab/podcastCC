import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { updateTimestampMarkerAction } from "../../actions";
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
} from "@/lib/ui-classes";

export default async function EditTimestampMarkerPage({
  params,
}: {
  params: Promise<{ id: string; markerId: string }>;
}) {
  await requireSession();
  const { id: episodeId, markerId } = await params;

  const marker = await prisma.timestampMarker.findUnique({ where: { id: markerId } });
  if (!marker || marker.episodeId !== episodeId) notFound();

  const episode = await prisma.episode.findUnique({ where: { id: episodeId } });
  if (!episode) notFound();

  return (
    <main className={PAGE}>
      <Breadcrumb
        items={[
          { label: "Beranda", href: "/dashboard" },
          { label: "Episode", href: "/episodes" },
          { label: episode.title, href: `/episodes/${episodeId}` },
          { label: "Timestamp / Chapter", href: `/episodes/${episodeId}/timestamps` },
          { label: "Edit Timestamp" },
        ]}
      />
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
        <div className="flex gap-2">
          <button type="submit" className={BUTTON_PRIMARY}>
            Simpan
          </button>
          <Link href={`/episodes/${episodeId}/timestamps`} className={BUTTON_SECONDARY}>
            Batal
          </Link>
        </div>
      </form>
    </main>
  );
}
