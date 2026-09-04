import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import {
  createGuestQuestionAction,
  deleteGuestQuestionAction,
  moveGuestQuestionAction,
} from "./actions";
import {
  BACK_LINK,
  BUTTON_DANGER,
  BUTTON_GHOST,
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
    <main className={PAGE}>
      <p className="mb-2">
        <Link href={`/episodes/${episodeId}`} className={BACK_LINK}>
          ← {episode.title}
        </Link>
      </p>
      <h1 className={H1}>Pertanyaan Narasumber: {episode.title}</h1>

      <ol className={CARD_LIST}>
        {items.map((item, index) => (
          <li key={item.id} className={CARD}>
            <p className="text-sm text-slate-900">{item.content}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <form action={moveGuestQuestionAction.bind(null, episodeId, item.id, "up")}>
                <button
                  type="submit"
                  disabled={index === 0}
                  aria-label="Pindahkan pertanyaan ke atas"
                  className={`${BUTTON_GHOST} disabled:opacity-40`}
                >
                  ↑
                </button>
              </form>
              <form action={moveGuestQuestionAction.bind(null, episodeId, item.id, "down")}>
                <button
                  type="submit"
                  disabled={index === items.length - 1}
                  aria-label="Pindahkan pertanyaan ke bawah"
                  className={`${BUTTON_GHOST} disabled:opacity-40`}
                >
                  ↓
                </button>
              </form>
              <Link
                href={`/episodes/${episodeId}/guest-questions/${item.id}/edit`}
                className={BUTTON_SECONDARY}
              >
                Edit
              </Link>
              <form action={deleteGuestQuestionAction.bind(null, episodeId, item.id)}>
                <button type="submit" className={BUTTON_DANGER}>
                  Hapus
                </button>
              </form>
            </div>
          </li>
        ))}
        {items.length === 0 && <p className={EMPTY_STATE}>Belum ada pertanyaan.</p>}
      </ol>

      <h2 className={H2}>Tambah Pertanyaan</h2>
      <form action={createGuestQuestionAction.bind(null, episodeId)} className={FORM}>
        <div className={FIELD_GROUP}>
          <label htmlFor="content" className={LABEL}>
            Pertanyaan
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
