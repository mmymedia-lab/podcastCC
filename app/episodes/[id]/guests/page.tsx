import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { createGuestAction, deleteGuestAction } from "./actions";

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
    <main>
      <p>
        <Link href={`/episodes/${episodeId}`}>← {episode.title}</Link>
      </p>
      <h1>Tamu & Narasumber: {episode.title}</h1>

      <ul>
        {guests.map((guest) => (
          <li key={guest.id}>
            <h2>{guest.name}</h2>
            {guest.contact && <p>Kontak: {guest.contact}</p>}
            {guest.briefingNotes && <p>Briefing: {guest.briefingNotes}</p>}
            <Link href={`/episodes/${episodeId}/guests/${guest.id}/edit`}>Edit</Link>
            <form action={deleteGuestAction.bind(null, episodeId, guest.id)} style={{ display: "inline" }}>
              <button type="submit">Hapus</button>
            </form>
          </li>
        ))}
        {guests.length === 0 && <p>Belum ada tamu.</p>}
      </ul>

      <h2>Tambah Tamu</h2>
      <form action={createGuestAction.bind(null, episodeId)}>
        <div>
          <label htmlFor="name">Nama</label>
          <input id="name" name="name" required />
        </div>
        <div>
          <label htmlFor="contact">Kontak (opsional)</label>
          <input id="contact" name="contact" placeholder="No. HP / email" />
        </div>
        <div>
          <label htmlFor="briefingNotes">Catatan Briefing (opsional)</label>
          <textarea id="briefingNotes" name="briefingNotes" />
        </div>
        <button type="submit">Tambah</button>
      </form>
    </main>
  );
}
