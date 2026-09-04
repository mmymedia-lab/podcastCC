import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { createGuestAction, deleteGuestAction } from "./actions";
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
  TEXTAREA,
} from "@/lib/ui-classes";

export default async function GuestsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireSession();
  const { id: episodeId } = await params;

  const episode = await prisma.episode.findUnique({ where: { id: episodeId } });
  if (!episode) notFound();

  const guests = await prisma.guest.findMany({
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
      <h1 className={H1}>Tamu & Narasumber: {episode.title}</h1>

      <ul className={CARD_LIST}>
        {guests.map((guest) => (
          <li key={guest.id} className={CARD}>
            <h2 className="font-medium text-slate-900">{guest.name}</h2>
            {guest.contact && <p className="mt-1 text-sm text-slate-600">Kontak: {guest.contact}</p>}
            {guest.briefingNotes && (
              <p className="mt-1 text-sm text-slate-600">Briefing: {guest.briefingNotes}</p>
            )}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Link href={`/episodes/${episodeId}/guests/${guest.id}/edit`} className={BUTTON_SECONDARY}>
                Edit
              </Link>
              <form action={deleteGuestAction.bind(null, episodeId, guest.id)}>
                <button type="submit" className={BUTTON_DANGER}>
                  Hapus
                </button>
              </form>
            </div>
          </li>
        ))}
        {guests.length === 0 && <p className={EMPTY_STATE}>Belum ada tamu.</p>}
      </ul>

      <h2 className={H2}>Tambah Tamu</h2>
      <form action={createGuestAction.bind(null, episodeId)} className={FORM}>
        <div className={FIELD_GROUP}>
          <label htmlFor="name" className={LABEL}>
            Nama
          </label>
          <input id="name" name="name" required className={INPUT} />
        </div>
        <div className={FIELD_GROUP}>
          <label htmlFor="contact" className={LABEL}>
            Kontak (opsional)
          </label>
          <input id="contact" name="contact" placeholder="No. HP / email" className={INPUT} />
        </div>
        <div className={FIELD_GROUP}>
          <label htmlFor="briefingNotes" className={LABEL}>
            Catatan Briefing (opsional)
          </label>
          <textarea id="briefingNotes" name="briefingNotes" className={TEXTAREA} />
        </div>
        <button type="submit" className={BUTTON_PRIMARY}>
          Tambah
        </button>
      </form>
    </main>
  );
}
