import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { updateGuestAction } from "../../actions";
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

export default async function EditGuestPage({
  params,
}: {
  params: Promise<{ id: string; guestId: string }>;
}) {
  await requireSession();
  const { id: episodeId, guestId } = await params;

  const guest = await prisma.guest.findUnique({ where: { id: guestId } });
  if (!guest || guest.episodeId !== episodeId) notFound();

  const episode = await prisma.episode.findUnique({ where: { id: episodeId } });
  if (!episode) notFound();

  return (
    <main className={PAGE}>
      <Breadcrumb
        items={[
          { label: "Beranda", href: "/dashboard" },
          { label: "Episode", href: "/episodes" },
          { label: episode.title, href: `/episodes/${episodeId}` },
          { label: "Tamu & Narasumber", href: `/episodes/${episodeId}/guests` },
          { label: "Edit Tamu" },
        ]}
      />
      <h1 className={H1}>Edit Tamu</h1>
      <form action={updateGuestAction.bind(null, episodeId, guest.id)} className={FORM}>
        <div className={FIELD_GROUP}>
          <label htmlFor="name" className={LABEL}>
            Nama
          </label>
          <input id="name" name="name" defaultValue={guest.name} required className={INPUT} />
        </div>
        <div className={FIELD_GROUP}>
          <label htmlFor="contact" className={LABEL}>
            Kontak (opsional)
          </label>
          <input id="contact" name="contact" defaultValue={guest.contact ?? ""} className={INPUT} />
        </div>
        <div className={FIELD_GROUP}>
          <label htmlFor="briefingNotes" className={LABEL}>
            Catatan Briefing (opsional)
          </label>
          <textarea
            id="briefingNotes"
            name="briefingNotes"
            defaultValue={guest.briefingNotes ?? ""}
            className={TEXTAREA}
          />
        </div>
        <div className="flex gap-2">
          <button type="submit" className={BUTTON_PRIMARY}>
            Simpan
          </button>
          <Link href={`/episodes/${episodeId}/guests`} className={BUTTON_SECONDARY}>
            Batal
          </Link>
        </div>
      </form>
    </main>
  );
}
