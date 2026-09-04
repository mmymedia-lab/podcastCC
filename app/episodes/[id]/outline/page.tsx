import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { createOutlineItemAction, deleteOutlineItemAction, moveOutlineItemAction } from "./actions";
import { AiOutlineAssist } from "./ai-outline-assist";
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
  INPUT,
  LABEL,
  PAGE,
  TEXTAREA,
} from "@/lib/ui-classes";

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
    <main className={PAGE}>
      <p className="mb-2">
        <Link href={`/episodes/${episodeId}`} className={BACK_LINK}>
          ← {episode.title}
        </Link>
      </p>
      <h1 className={H1}>Outline: {episode.title}</h1>

      <AiOutlineAssist episodeTitle={episode.title} />

      <ol className={CARD_LIST}>
        {items.map((item, index) => (
          <li key={item.id} className={CARD}>
            <p className="text-sm text-slate-900">{item.content}</p>
            {item.referenceUrl && (
              <p className="mt-1">
                <a
                  href={item.referenceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-primary-700 hover:underline"
                >
                  Referensi ↗
                </a>
              </p>
            )}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <form action={moveOutlineItemAction.bind(null, episodeId, item.id, "up")}>
                <button
                  type="submit"
                  disabled={index === 0}
                  aria-label="Pindahkan poin bicara ke atas"
                  className={`${BUTTON_GHOST} disabled:opacity-40`}
                >
                  ↑
                </button>
              </form>
              <form action={moveOutlineItemAction.bind(null, episodeId, item.id, "down")}>
                <button
                  type="submit"
                  disabled={index === items.length - 1}
                  aria-label="Pindahkan poin bicara ke bawah"
                  className={`${BUTTON_GHOST} disabled:opacity-40`}
                >
                  ↓
                </button>
              </form>
              <Link href={`/episodes/${episodeId}/outline/${item.id}/edit`} className={BUTTON_SECONDARY}>
                Edit
              </Link>
              <form action={deleteOutlineItemAction.bind(null, episodeId, item.id)}>
                <button type="submit" className={BUTTON_DANGER}>
                  Hapus
                </button>
              </form>
            </div>
          </li>
        ))}
        {items.length === 0 && <p className={EMPTY_STATE}>Belum ada poin bicara.</p>}
      </ol>

      <h2 className={H2}>Tambah Poin Bicara</h2>
      <form action={createOutlineItemAction.bind(null, episodeId)} className={FORM}>
        <div className={FIELD_GROUP}>
          <label htmlFor="content" className={LABEL}>
            Poin bicara
          </label>
          <textarea id="content" name="content" required className={TEXTAREA} />
        </div>
        <div className={FIELD_GROUP}>
          <label htmlFor="referenceUrl" className={LABEL}>
            Link referensi (opsional)
          </label>
          <input
            id="referenceUrl"
            name="referenceUrl"
            type="url"
            placeholder="https://docs.google.com/..."
            className={INPUT}
          />
        </div>
        <button type="submit" className={BUTTON_PRIMARY}>
          Tambah
        </button>
      </form>
    </main>
  );
}
