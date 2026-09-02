import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { CHECKLIST_CATEGORY_LABELS, slugToCategory } from "../categories";
import { createChecklistItemAction, deleteChecklistItemAction, toggleChecklistItemAction } from "../actions";

export default async function ChecklistPage({
  params,
}: {
  params: Promise<{ id: string; category: string }>;
}) {
  await requireSession();
  const { id: episodeId, category: slug } = await params;

  const category = slugToCategory(slug);
  if (!category) notFound();

  const episode = await prisma.episode.findUnique({ where: { id: episodeId } });
  if (!episode) notFound();

  const items = await prisma.checklistItem.findMany({
    where: { episodeId, category },
    orderBy: { order: "asc" },
  });

  return (
    <main>
      <p>
        <Link href={`/episodes/${episodeId}`}>← {episode.title}</Link>
      </p>
      <h1>
        {CHECKLIST_CATEGORY_LABELS[category]}: {episode.title}
      </h1>

      <ul>
        {items.map((item) => (
          <li key={item.id}>
            <form
              action={toggleChecklistItemAction.bind(null, episodeId, slug, item.id)}
              style={{ display: "inline" }}
            >
              <button type="submit" aria-pressed={item.isDone}>
                {item.isDone ? "☑" : "☐"}
              </button>
            </form>
            <span style={{ textDecoration: item.isDone ? "line-through" : undefined }}>
              {item.label}
            </span>
            <form
              action={deleteChecklistItemAction.bind(null, episodeId, slug, item.id)}
              style={{ display: "inline" }}
            >
              <button type="submit">Hapus</button>
            </form>
          </li>
        ))}
        {items.length === 0 && <p>Belum ada item checklist.</p>}
      </ul>

      <h2>Tambah Item</h2>
      <form action={createChecklistItemAction.bind(null, episodeId, category, slug)}>
        <div>
          <label htmlFor="label">Item</label>
          <input id="label" name="label" required />
        </div>
        <button type="submit">Tambah</button>
      </form>
    </main>
  );
}
