import { notFound } from "next/navigation";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { updateThemeIdeaAction } from "../../actions";

export default async function EditThemeIdeaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireSession();
  const { id } = await params;

  const idea = await prisma.themeIdea.findUnique({ where: { id } });
  if (!idea) notFound();

  return (
    <main>
      <h1>Edit Ide Topik</h1>
      <form action={updateThemeIdeaAction.bind(null, idea.id)}>
        <div>
          <label htmlFor="title">Judul</label>
          <input id="title" name="title" defaultValue={idea.title} required />
        </div>
        <div>
          <label htmlFor="description">Deskripsi</label>
          <textarea id="description" name="description" defaultValue={idea.description ?? ""} />
        </div>
        <div>
          <label htmlFor="tags">Tag (pisahkan dengan koma)</label>
          <input id="tags" name="tags" defaultValue={idea.tags.join(", ")} />
        </div>
        <button type="submit">Simpan</button>
      </form>
    </main>
  );
}
