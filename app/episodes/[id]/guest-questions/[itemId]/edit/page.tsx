import { notFound } from "next/navigation";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { updateGuestQuestionAction } from "../../actions";

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
    <main>
      <h1>Edit Pertanyaan</h1>
      <form action={updateGuestQuestionAction.bind(null, episodeId, item.id)}>
        <div>
          <label htmlFor="content">Pertanyaan</label>
          <textarea id="content" name="content" defaultValue={item.content} required />
        </div>
        <button type="submit">Simpan</button>
      </form>
    </main>
  );
}
