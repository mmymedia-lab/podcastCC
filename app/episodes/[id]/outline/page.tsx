import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { createOutlineItemAction, deleteOutlineItemAction, moveOutlineItemAction } from "./actions";
import { AiOutlineAssist } from "./ai-outline-assist";

export default async function OutlinePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireSession();
  const { id: episodeId } = await params;

  const episode = await prisma.episode.findUnique({ where: { id: episodeId } });
  if (!episode) notFound();

  const items = await prisma.outlineItem.findMany({
    where: { episodeId },
    orderBy: { order: "asc" },
  });

  return (
    <main>
      <p>
        <Link href={`/episodes/${episodeId}`}>← {episode.title}</Link>
      </p>
      <h1>Outline: {episode.title}</h1>

      <AiOutlineAssist episodeTitle={episode.title} />

      <ol>
        {items.map((item, index) => (
          <li key={item.id}>
            <p>{item.content}</p>
            {item.referenceUrl && (
              <p>
                <a href={item.referenceUrl} target="_blank" rel="noreferrer">
                  Referensi ↗
                </a>
              </p>
            )}
            <form
              action={moveOutlineItemAction.bind(null, episodeId, item.id, "up")}
              style={{ display: "inline" }}
            >
              <button type="submit" disabled={index === 0}>
                ↑
              </button>
            </form>
            <form
              action={moveOutlineItemAction.bind(null, episodeId, item.id, "down")}
              style={{ display: "inline" }}
            >
              <button type="submit" disabled={index === items.length - 1}>
                ↓
              </button>
            </form>
            <Link href={`/episodes/${episodeId}/outline/${item.id}/edit`}>Edit</Link>
            <form
              action={deleteOutlineItemAction.bind(null, episodeId, item.id)}
              style={{ display: "inline" }}
            >
              <button type="submit">Hapus</button>
            </form>
          </li>
        ))}
        {items.length === 0 && <p>Belum ada poin bicara.</p>}
      </ol>

      <h2>Tambah Poin Bicara</h2>
      <form action={createOutlineItemAction.bind(null, episodeId)}>
        <div>
          <label htmlFor="content">Poin bicara</label>
          <textarea id="content" name="content" required />
        </div>
        <div>
          <label htmlFor="referenceUrl">Link referensi (opsional)</label>
          <input
            id="referenceUrl"
            name="referenceUrl"
            type="url"
            placeholder="https://docs.google.com/..."
          />
        </div>
        <button type="submit">Tambah</button>
      </form>
    </main>
  );
}
