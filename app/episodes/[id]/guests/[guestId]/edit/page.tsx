import { notFound } from "next/navigation";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { updateGuestAction } from "../../actions";
import { BUTTON_PRIMARY, FIELD_GROUP, FORM, H1, INPUT, LABEL, PAGE, TEXTAREA } from "@/lib/ui-classes";

export default async function EditGuestPage({
  params,
}: {
  params: Promise<{ id: string; guestId: string }>;
}) {
  await requireSession();
  const { id: episodeId, guestId } = await params;

  const guest = await prisma.guest.findUnique({ where: { id: guestId } });
  if (!guest || guest.episodeId !== episodeId) notFound();

  return (
    <main className={PAGE}>
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
        <button type="submit" className={BUTTON_PRIMARY}>
          Simpan
        </button>
      </form>
    </main>
  );
}
