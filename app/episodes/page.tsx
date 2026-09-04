import Link from "next/link";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { EpisodeStage } from "@prisma/client";
import { STAGE_LABELS, STAGE_ORDER } from "./stages";
import { StageBadge } from "@/components/ui/StageBadge";
import { CARD, CARD_LIST, EMPTY_STATE, H1, PAGE } from "@/lib/ui-classes";

export default async function EpisodesPage({
  searchParams,
}: {
  searchParams: Promise<{ stage?: string }>;
}) {
  await requireSession();
  const { stage: rawStage } = await searchParams;
  const activeStage =
    rawStage && STAGE_ORDER.includes(rawStage as EpisodeStage) ? (rawStage as EpisodeStage) : undefined;

  const episodes = await prisma.episode.findMany({
    where: activeStage ? { stage: activeStage } : undefined,
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className={PAGE}>
      <h1 className={H1}>Episode</h1>

      <nav aria-label="Filter tahap" className="mb-4 flex flex-wrap gap-2">
        <Link
          href="/episodes"
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            !activeStage ? "bg-primary-700 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          Semua
        </Link>
        {STAGE_ORDER.map((stage) => (
          <Link
            key={stage}
            href={`/episodes?stage=${stage}`}
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              activeStage === stage
                ? "bg-primary-700 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {STAGE_LABELS[stage]}
          </Link>
        ))}
      </nav>

      <ul className={CARD_LIST}>
        {episodes.map((episode) => (
          <li key={episode.id}>
            <Link
              href={`/episodes/${episode.id}`}
              className={`${CARD} flex items-center justify-between transition-shadow hover:shadow-md`}
            >
              <span className="font-medium text-slate-900">{episode.title}</span>
              <StageBadge stage={episode.stage} />
            </Link>
          </li>
        ))}
        {episodes.length === 0 && <p className={EMPTY_STATE}>Belum ada episode.</p>}
      </ul>
    </main>
  );
}
