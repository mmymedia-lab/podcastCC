import { notFound } from "next/navigation";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { createEvaluationNoteAction, deleteEvaluationNoteAction } from "./actions";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import {
  BUTTON_DANGER,
  BUTTON_PRIMARY,
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

export default async function ProjectEvaluationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireSession();
  const { id: projectId } = await params;

  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) notFound();

  const notes = await prisma.projectEvaluationNote.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className={PAGE}>
      <Breadcrumb
        items={[
          { label: "Beranda", href: "/dashboard" },
          { label: "Video", href: "/videos" },
          { label: project.title, href: `/videos/${projectId}` },
          { label: "Evaluasi" },
        ]}
      />
      <h1 className={H1}>Evaluasi Pasca-Tayang: {project.title}</h1>

      <ul className={CARD_LIST}>
        {notes.map((note) => (
          <li key={note.id} className={CARD}>
            <p className="whitespace-pre-wrap text-sm text-slate-900">{note.content}</p>
            <form action={deleteEvaluationNoteAction.bind(null, projectId, note.id)} className="mt-3">
              <button type="submit" className={BUTTON_DANGER}>
                Hapus
              </button>
            </form>
          </li>
        ))}
        {notes.length === 0 && <p className={EMPTY_STATE}>Belum ada catatan evaluasi.</p>}
      </ul>

      <h2 className={H2}>Tambah Catatan</h2>
      <form action={createEvaluationNoteAction.bind(null, projectId)} className={FORM}>
        <div className={FIELD_GROUP}>
          <label htmlFor="content" className={LABEL}>
            Catatan (performa tayang, respons penonton, hal yang perlu diperbaiki, dll.)
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
