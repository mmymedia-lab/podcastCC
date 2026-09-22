import { redirect } from "next/navigation";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getWorkspaceSettings } from "@/lib/workspace-settings";
import { STAGE_LABELS, STAGE_ORDER } from "../episodes/stages";
import { STAGE_TO_PHASE } from "../episodes/phases";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { PhaseLegend } from "@/components/ui/PhaseLegend";
import { H1, PAGE_WIDE } from "@/lib/ui-classes";
import { KanbanBoard, type EpisodeCardData, type KanbanColumn } from "./kanban-board";

function formatRecordingDate(date: Date | null): string | null {
  if (!date) return null;
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(
    date,
  );
}

/** First 2 initials from a name (or the local part of an email as fallback). */
function initialsOf(nameOrEmail: string): string {
  const trimmed = nameOrEmail.trim();
  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return trimmed.slice(0, 2).toUpperCase();
}

export default async function BoardPage() {
  await requireSession();

  const settings = await getWorkspaceSettings();
  if (settings.mode !== "TIM") {
    redirect("/episodes");
  }

  const episodes = await prisma.episode.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      host: { select: { name: true } },
      checklistItems: { select: { isDone: true } },
      roles: { select: { userId: true, user: { select: { name: true, email: true } } } },
    },
  });

  const cards: EpisodeCardData[] = episodes.map((episode) => {
    const seenUserIds = new Set<string>();
    const teamInitials: string[] = [];
    for (const role of episode.roles) {
      if (seenUserIds.has(role.userId)) continue;
      seenUserIds.add(role.userId);
      teamInitials.push(initialsOf(role.user.name || role.user.email));
    }

    return {
      id: episode.id,
      title: episode.title,
      stage: episode.stage,
      recordingDate: formatRecordingDate(episode.recordingScheduledAt),
      hostName: episode.host?.name ?? null,
      checklistDone: episode.checklistItems.filter((item) => item.isDone).length,
      checklistTotal: episode.checklistItems.length,
      teamInitials,
    };
  });

  const columns: KanbanColumn[] = STAGE_ORDER.map((stage) => ({
    stage,
    phase: STAGE_TO_PHASE[stage],
    label: STAGE_LABELS[stage],
    episodes: cards.filter((card) => card.stage === stage),
  }));

  return (
    <main className={PAGE_WIDE}>
      <Breadcrumb items={[{ label: "Beranda", href: "/dashboard" }, { label: "Board" }]} />
      <h1 className={H1}>Board</h1>
      <KanbanBoard initialColumns={columns} />
      <PhaseLegend />
    </main>
  );
}
