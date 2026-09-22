import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSession, resolveUserId } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { canUnlockEpisodePascaProduksi, getEpisodePascaProduksiGate } from "@/lib/permissions";
import { updateTimestampMarkerAction } from "../../actions";
import { lockEpisodePascaProduksiAction, unlockEpisodePascaProduksiAction } from "@/app/episodes/actions";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { PascaProduksiGateNotice } from "@/components/ui/PascaProduksiGateNotice";
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
  const session = await requireSession();
  const { id: episodeId, markerId } = await params;

  const marker = await prisma.timestampMarker.findUnique({ where: { id: markerId } });
  if (!marker || marker.episodeId !== episodeId) notFound();

  const episode = await prisma.episode.findUnique({ where: { id: episodeId } });
  if (!episode) notFound();

  const userId = await resolveUserId(session);
  const pascaProduksiGate = await getEpisodePascaProduksiGate(episodeId);
  const canTogglePascaProduksi = userId ? await canUnlockEpisodePascaProduksi(userId, episodeId) : false;
  const locked = !pascaProduksiGate.unlocked;

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

      <PascaProduksiGateNotice
        unlocked={pascaProduksiGate.unlocked}
        productionDate={pascaProduksiGate.productionDate}
        manualOverride={pascaProduksiGate.manualOverride}
        canToggle={canTogglePascaProduksi}
        unlockAction={unlockEpisodePascaProduksiAction.bind(null, episodeId)}
        lockAction={lockEpisodePascaProduksiAction.bind(null, episodeId)}
      />

      <form action={updateTimestampMarkerAction.bind(null, episodeId, marker.id)} className={FORM}>
        <fieldset disabled={locked}>
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
        </fieldset>
      </form>
    </main>
  );
}
