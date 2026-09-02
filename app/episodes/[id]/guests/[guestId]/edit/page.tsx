import { notFound } from "next/navigation";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { updateGuestAction } from "../../actions";

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
    <main>
      <h1>Edit Tamu</h1>
      <form action={updateGuestAction.bind(null, episodeId, guest.id)}>
        <div>
          <label htmlFor="name">Nama</label>
          <input id="name" name="name" defaultValue={guest.name} required />
        </div>
        <div>
          <label htmlFor="contact">Kontak (opsional)</label>
          <input id="contact" name="contact" defaultValue={guest.contact ?? ""} />
        </div>
        <div>
          <label htmlFor="briefingNotes">Catatan Briefing (opsional)</label>
          <textarea id="briefingNotes" name="briefingNotes" defaultValue={guest.briefingNotes ?? ""} />
        </div>
        <button type="submit">Simpan</button>
      </form>
    </main>
  );
}
