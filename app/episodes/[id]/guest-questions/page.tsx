import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import {
  createGuestQuestionAction,
  deleteGuestQuestionAction,
  moveGuestQuestionAction,
} from "./actions";

export default async function GuestQuestionsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireSession();
  const { id: episodeId } = await params;

  const episode = await prisma.episode.findUnique({ where: { id: episodeId } });
  if (!episode) notFound();

  const items = await prisma.guestQuestion.findMany({
    where: { episodeId },
    orderBy: { order: "asc" },
  });

  return (
    <main>
      <p>
        <Link href={`/episodes/${episodeId}`}>← {episode.title}</Link>
      </p>
      <h1>Pertanyaan Narasumber: {episode.title}</h1>

      <ol>
        {items.map((item, index) => (
          <li key={item.id}>
            <p>{item.content}</p>
            <form
              action={moveGuestQuestionAction.bind(null, episodeId, item.id, "up")}
              style={{ display: "inline" }}
            >
              <button
                type="submit"
                disabled={index === 0}
                aria-label="Pindahkan pertanyaan ke atas"
                style={{ minWidth: "2.5rem", minHeight: "2.5rem" }}
              >
                ↑
              </button>
            </form>
            <form
              action={moveGuestQuestionAction.bind(null, episodeId, item.id, "down")}
              style={{ display: "inline" }}
            >
              <button
                type="submit"
                disabled={index === items.length - 1}
                aria-label="Pindahkan pertanyaan ke bawah"
                style={{ minWidth: "2.5rem", minHeight: "2.5rem" }}
              >
                ↓
              </button>
            </form>
            <Link href={`/episodes/${episodeId}/guest-questions/${item.id}/edit`}>Edit</Link>
            <form
              action={deleteGuestQuestionAction.bind(null, episodeId, item.id)}
              style={{ display: "inline" }}
            >
              <button type="submit">Hapus</button>
            </form>
          </li>
        ))}
        {items.length === 0 && <p>Belum ada pertanyaan.</p>}
      </ol>

      <h2>Tambah Pertanyaan</h2>
      <form action={createGuestQuestionAction.bind(null, episodeId)}>
        <div>
          <label htmlFor="content">Pertanyaan</label>
          <textarea id="content" name="content" required />
        </div>
        <button type="submit">Tambah</button>
      </form>
    </main>
  );
}
