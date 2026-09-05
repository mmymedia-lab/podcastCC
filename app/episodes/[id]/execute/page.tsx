import { notFound } from "next/navigation";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ExecuteClient } from "./execute-client";

export default async function ExecutePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireSession();
  const { id: episodeId } = await params;

  const episode = await prisma.episode.findUnique({ where: { id: episodeId } });
  if (!episode) notFound();

  const segments = await prisma.rundownSegment.findMany({
    where: { episodeId },
    orderBy: { order: "asc" },
    select: {
      id: true,
      title: true,
      talkingPoints: true,
      estimatedMinutes: true,
      sessionNote: true,
    },
  });

  const guestQuestions = await prisma.guestQuestion.findMany({
    where: { episodeId },
    orderBy: { order: "asc" },
    select: { id: true, content: true },
  });

  return (
    <ExecuteClient
      episodeId={episodeId}
      episodeTitle={episode.title}
      segments={segments}
      guestQuestions={guestQuestions}
    />
  );
}
