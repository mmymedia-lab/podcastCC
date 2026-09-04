import { notFound } from "next/navigation";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { updateOutlineItemAction } from "../../actions";
import { BUTTON_PRIMARY, FIELD_GROUP, FORM, H1, INPUT, LABEL, PAGE, TEXTAREA } from "@/lib/ui-classes";

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
    <main className={PAGE}>
      <h1 className={H1}>Edit Poin Bicara</h1>
      <form action={updateOutlineItemAction.bind(null, episodeId, item.id)} className={FORM}>
        <div className={FIELD_GROUP}>
          <label htmlFor="content" className={LABEL}>
            Poin bicara
          </label>
          <textarea id="content" name="content" defaultValue={item.content} required className={TEXTAREA} />
        </div>
        <div className={FIELD_GROUP}>
          <label htmlFor="referenceUrl" className={LABEL}>
            Link referensi (opsional)
          </label>
          <input
            id="referenceUrl"
            name="referenceUrl"
            type="url"
            defaultValue={item.referenceUrl ?? ""}
            className={INPUT}
          />
        </div>
        <button type="submit" className={BUTTON_PRIMARY}>
          Simpan
        </button>
      </form>
    </main>
  );
}
