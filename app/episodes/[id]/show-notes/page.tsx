import { notFound } from "next/navigation";
import { requireSession, resolveUserId } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { canUnlockEpisodePascaProduksi, getEpisodePascaProduksiGate } from "@/lib/permissions";
import { lockEpisodePascaProduksiAction, unlockEpisodePascaProduksiAction } from "@/app/episodes/actions";
import { ShowNotesForm } from "./show-notes-form";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { PascaProduksiGateNotice } from "@/components/ui/PascaProduksiGateNotice";
import { H1, PAGE } from "@/lib/ui-classes";

export default async function ShowNotesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireSession();
  const { id: episodeId } = await params;

  const episode = await prisma.episode.findUnique({ where: { id: episodeId } });
  if (!episode) notFound();

  const outlineItems = await prisma.outlineItem.findMany({
    where: { episodeId },
    orderBy: { order: "asc" },
  });
  const outlineText = outlineItems.map((item) => `- ${item.content}`).join("\n");

  const userId = await resolveUserId(session);
  const pascaProduksiGate = await getEpisodePascaProduksiGate(episodeId);
  const canTogglePascaProduksi = userId ? await canUnlockEpisodePascaProduksi(userId, episodeId) : false;

  return (
    <main className={PAGE}>
      <Breadcrumb
        items={[
          { label: "Beranda", href: "/dashboard" },
          { label: "Episode", href: "/episodes" },
          { label: episode.title, href: `/episodes/${episodeId}` },
          { label: "Show Notes" },
        ]}
      />
      <h1 className={H1}>Show Notes: {episode.title}</h1>

      <PascaProduksiGateNotice
        unlocked={pascaProduksiGate.unlocked}
        productionDate={pascaProduksiGate.productionDate}
        manualOverride={pascaProduksiGate.manualOverride}
        canToggle={canTogglePascaProduksi}
        unlockAction={unlockEpisodePascaProduksiAction.bind(null, episodeId)}
        lockAction={lockEpisodePascaProduksiAction.bind(null, episodeId)}
      />

      <ShowNotesForm
        episodeId={episodeId}
        initialDraft={episode.showNotesDraft ?? ""}
        initialExternalUrl={episode.showNotesExternalUrl ?? ""}
        outlineText={outlineText}
      />
    </main>
  );
}
