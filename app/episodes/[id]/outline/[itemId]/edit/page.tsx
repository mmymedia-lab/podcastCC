import { notFound } from "next/navigation";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { updateOutlineItemAction } from "../../actions";

export default async function EditOutlineItemPage({
  params,
}: {
  params: Promise<{ id: string; itemId: string }>;
}) {
  await requireSession();
  const { id: episodeId, itemId } = await params;

  const item = await prisma.outlineItem.findUnique({ where: { id: itemId } });
  if (!item || item.episodeId !== episodeId) notFound();

  return (
    <main>
      <h1>Edit Poin Bicara</h1>
      <form action={updateOutlineItemAction.bind(null, episodeId, item.id)}>
        <div>
          <label htmlFor="content">Poin bicara</label>
          <textarea id="content" name="content" defaultValue={item.content} required />
        </div>
        <div>
          <label htmlFor="referenceUrl">Link referensi (opsional)</label>
          <input
            id="referenceUrl"
            name="referenceUrl"
            type="url"
            defaultValue={item.referenceUrl ?? ""}
          />
        </div>
        <button type="submit">Simpan</button>
      </form>
    </main>
  );
}
