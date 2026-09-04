import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ShowNotesForm } from "./show-notes-form";
import { BACK_LINK, H1, PAGE } from "@/lib/ui-classes";

export default async function ShowNotesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireSession();
  const { id: episodeId } = await params;

  const episode = await prisma.episode.findUnique({ where: { id: episodeId } });
  if (!episode) notFound();

  const outlineItems = await prisma.outlineItem.findMany({
    where: { episodeId },
    orderBy: { order: "asc" },
  });
  const outlineText = outlineItems.map((item) => `- ${item.content}`).join("\n");

  return (
    <main className={PAGE}>
      <p className="mb-2">
        <Link href={`/episodes/${episodeId}`} className={BACK_LINK}>
          ← {episode.title}
        </Link>
      </p>
      <h1 className={H1}>Show Notes: {episode.title}</h1>

      <ShowNotesForm
        episodeId={episodeId}
        initialDraft={episode.showNotesDraft ?? ""}
        initialExternalUrl={episode.showNotesExternalUrl ?? ""}
        outlineText={outlineText}
      />
    </main>
  );
}
