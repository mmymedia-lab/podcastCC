import Link from "next/link";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getWorkspaceSettings } from "@/lib/workspace-settings";
import { STAGE_LABELS, STAGE_ORDER } from "../episodes/stages";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { H1, PAGE_WIDE } from "@/lib/ui-classes";

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
    <main className={PAGE_WIDE}>
      <Breadcrumb items={[{ label: "Beranda", href: "/dashboard" }, { label: "Board" }]} />
      <h1 className={H1}>Board</h1>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {STAGE_ORDER.map((stage) => {
          const episodesInStage = episodes.filter((episode) => episode.stage === stage);
          return (
            <div key={stage} className="w-64 shrink-0 rounded-lg bg-slate-100 p-3">
              <h2 className="mb-3 text-sm font-semibold text-slate-700">
                {STAGE_LABELS[stage]}{" "}
                <span className="font-normal text-slate-400">({episodesInStage.length})</span>
              </h2>
              <ul className="space-y-2">
                {episodesInStage.map((episode) => (
                  <li key={episode.id}>
                    <Link
                      href={`/episodes/${episode.id}`}
                      className="block rounded-md bg-white p-2 text-sm text-slate-900 shadow-sm transition-shadow hover:shadow-md"
                    >
                      {episode.title}
                    </Link>
                  </li>
                ))}
                {episodesInStage.length === 0 && <li className="text-sm text-slate-400">—</li>}
              </ul>
            </div>
          );
        })}
      </div>
    </main>
  );
}
