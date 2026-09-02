import Link from "next/link";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getWorkspaceSettings } from "@/lib/workspace-settings";
import { STAGE_LABELS, STAGE_ORDER } from "../episodes/stages";

export default async function BoardPage() {
  await requireSession();

  const settings = await getWorkspaceSettings();
  if (settings.mode !== "TIM") {
    redirect("/episodes");
  }

  const episodes = await prisma.episode.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <main>
      <h1>Board</h1>
      <div style={{ display: "flex", gap: "1.5rem", overflowX: "auto" }}>
        {STAGE_ORDER.map((stage) => {
          const episodesInStage = episodes.filter((episode) => episode.stage === stage);
          return (
            <div key={stage} style={{ minWidth: "16rem" }}>
              <h2>
                {STAGE_LABELS[stage]} ({episodesInStage.length})
              </h2>
              <ul>
                {episodesInStage.map((episode) => (
                  <li key={episode.id}>
                    <Link href={`/episodes/${episode.id}`}>{episode.title}</Link>
                  </li>
                ))}
                {episodesInStage.length === 0 && <li>—</li>}
              </ul>
            </div>
          );
        })}
      </div>
    </main>
  );
}
