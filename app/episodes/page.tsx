import Link from "next/link";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { EpisodeStage } from "@prisma/client";
import { STAGE_LABELS, STAGE_ORDER } from "./stages";

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
    <main>
      <h1>Episode</h1>

      <nav aria-label="Filter tahap">
        <Link href="/episodes">Semua</Link>
        {STAGE_ORDER.map((stage) => (
          <Link key={stage} href={`/episodes?stage=${stage}`}>
            {" "}
            {STAGE_LABELS[stage]}
          </Link>
        ))}
      </nav>

      <ul>
        {episodes.map((episode) => (
          <li key={episode.id}>
            <Link href={`/episodes/${episode.id}`}>{episode.title}</Link> — {STAGE_LABELS[episode.stage]}
          </li>
        ))}
        {episodes.length === 0 && <p>Belum ada episode.</p>}
      </ul>
    </main>
  );
}
