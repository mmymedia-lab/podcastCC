import { notFound } from "next/navigation";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { updateGuestQuestionAction } from "../../actions";
import { BUTTON_PRIMARY, FIELD_GROUP, FORM, H1, LABEL, PAGE, TEXTAREA } from "@/lib/ui-classes";

export default async function EditGuestQuestionPage({
  params,
}: {
  params: Promise<{ id: string; itemId: string }>;
}) {
  await requireSession();
  const { id: episodeId, itemId } = await params;

  const item = await prisma.guestQuestion.findUnique({ where: { id: itemId } });
  if (!item || item.episodeId !== episodeId) notFound();

  return (
    <main className={PAGE}>
      <h1 className={H1}>Edit Pertanyaan</h1>
      <form action={updateGuestQuestionAction.bind(null, episodeId, item.id)} className={FORM}>
        <div className={FIELD_GROUP}>
          <label htmlFor="content" className={LABEL}>
            Pertanyaan
          </label>
          <textarea id="content" name="content" defaultValue={item.content} required className={TEXTAREA} />
        </div>
        <button type="submit" className={BUTTON_PRIMARY}>
          Simpan
        </button>
      </form>
    </main>
  );
}
