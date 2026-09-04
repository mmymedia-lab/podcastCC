import Link from "next/link";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { deleteThemeIdeaAction } from "./actions";
import { convertThemeIdeaToEpisodeAction } from "../episodes/actions";
import { AiThemeIdeaAssist } from "./ai-theme-idea-assist";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import {
  BUTTON_DANGER,
  BUTTON_PRIMARY,
  BUTTON_SECONDARY,
  CARD,
  CARD_LIST,
  EMPTY_STATE,
  H1,
  PAGE,
} from "@/lib/ui-classes";

export default async function BankTemaPage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string }>;
}) {
  await requireSession();
  const { tag: activeTag } = await searchParams;

  const [ideas, allTagRows] = await Promise.all([
    prisma.themeIdea.findMany({
      where: activeTag ? { tags: { has: activeTag } } : undefined,
      orderBy: { createdAt: "desc" },
    }),
    prisma.themeIdea.findMany({ select: { tags: true } }),
  ]);

  const uniqueTags = Array.from(new Set(allTagRows.flatMap((row) => row.tags))).sort();

  return (
    <main className={PAGE}>
      <Breadcrumb items={[{ label: "Beranda", href: "/dashboard" }, { label: "Bank Tema" }]} />
      <div className="mb-6 flex items-center justify-between">
        <h1 className={`${H1} mb-0 mt-0`}>Bank Tema</h1>
        <Link href="/bank-tema/new" className={BUTTON_PRIMARY}>
          + Tambah ide baru
        </Link>
      </div>

      <AiThemeIdeaAssist />

      {uniqueTags.length > 0 && (
        <nav aria-label="Filter tag" className="mb-4 flex flex-wrap gap-2">
          <Link
            href="/bank-tema"
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              !activeTag ? "bg-primary-700 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Semua
          </Link>
          {uniqueTags.map((tag) => (
            <Link
              key={tag}
              href={`/bank-tema?tag=${encodeURIComponent(tag)}`}
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                activeTag === tag
                  ? "bg-primary-700 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {tag}
            </Link>
          ))}
        </nav>
      )}

      <ul className={CARD_LIST}>
        {ideas.map((idea) => (
          <li key={idea.id} className={CARD}>
            <h2 className="font-medium text-slate-900">{idea.title}</h2>
            {idea.description && <p className="mt-1 text-sm text-slate-600">{idea.description}</p>}
            {idea.tags.length > 0 && (
              <p className="mt-1 text-xs text-slate-500">Tag: {idea.tags.join(", ")}</p>
            )}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Link href={`/bank-tema/${idea.id}/edit`} className={BUTTON_SECONDARY}>
                Edit
              </Link>
              <form action={deleteThemeIdeaAction.bind(null, idea.id)}>
                <button type="submit" className={BUTTON_DANGER}>
                  Hapus
                </button>
              </form>
              {idea.episodeId ? (
                <Link href={`/episodes/${idea.episodeId}`} className={BUTTON_SECONDARY}>
                  Lihat episode →
                </Link>
              ) : (
                <form action={convertThemeIdeaToEpisodeAction.bind(null, idea.id)}>
                  <button type="submit" className={BUTTON_PRIMARY}>
                    Jadikan Episode
                  </button>
                </form>
              )}
            </div>
          </li>
        ))}
        {ideas.length === 0 && (
          <p className={EMPTY_STATE}>Belum ada ide{activeTag ? ` dengan tag "${activeTag}"` : ""}.</p>
        )}
      </ul>
    </main>
  );
}
