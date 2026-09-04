import { notFound } from "next/navigation";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import {
  convertNoteToThemeIdeaAction,
  createEvaluationNoteAction,
  deleteEvaluationNoteAction,
} from "./actions";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import {
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
  LABEL,
  PAGE,
  TEXTAREA,
} from "@/lib/ui-classes";

export default async function EvaluationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireSession();
  const { id: episodeId } = await params;

  const episode = await prisma.episode.findUnique({ where: { id: episodeId } });
  if (!episode) notFound();

  const notes = await prisma.evaluationNote.findMany({
    where: { episodeId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className={PAGE}>
      <Breadcrumb
        items={[
          { label: "Beranda", href: "/dashboard" },
          { label: "Episode", href: "/episodes" },
          { label: episode.title, href: `/episodes/${episodeId}` },
          { label: "Evaluasi" },
        ]}
      />
      <h1 className={H1}>Evaluasi: {episode.title}</h1>

      <ul className={CARD_LIST}>
        {notes.map((note) => (
          <li key={note.id} className={CARD}>
            <p className="whitespace-pre-wrap text-sm text-slate-900">{note.content}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {note.convertedToThemeIdeaAt ? (
                <span className="text-sm text-primary-700">✓ Sudah dijadikan ide</span>
              ) : (
                <form action={convertNoteToThemeIdeaAction.bind(null, episodeId, note.id)}>
                  <button type="submit" className={BUTTON_SECONDARY}>
                    Jadikan ide baru
                  </button>
                </form>
              )}
              <form action={deleteEvaluationNoteAction.bind(null, episodeId, note.id)}>
                <button type="submit" className={BUTTON_DANGER}>
                  Hapus
                </button>
              </form>
            </div>
          </li>
        ))}
        {notes.length === 0 && <p className={EMPTY_STATE}>Belum ada catatan evaluasi.</p>}
      </ul>

      <h2 className={H2}>Tambah Catatan</h2>
      <form action={createEvaluationNoteAction.bind(null, episodeId)} className={FORM}>
        <div className={FIELD_GROUP}>
          <label htmlFor="content" className={LABEL}>
            Catatan (apa yang berjalan baik/kurang, ide follow-up, dll.)
          </label>
          <textarea id="content" name="content" required className={TEXTAREA} />
        </div>
        <button type="submit" className={BUTTON_PRIMARY}>
          Tambah
        </button>
      </form>
    </main>
  );
}
