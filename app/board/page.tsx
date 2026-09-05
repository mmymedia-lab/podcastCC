import Link from "next/link";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getWorkspaceSettings } from "@/lib/workspace-settings";
import { STAGE_LABELS, STAGE_ORDER } from "../episodes/stages";
import { STAGE_TO_PHASE } from "../episodes/phases";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { PhaseLegend } from "@/components/ui/PhaseLegend";
import { H1, PAGE_WIDE } from "@/lib/ui-classes";

const COLUMN_HEADER_STYLE: Record<string, string> = {
  PRA_PRODUKSI: "border-t-4 border-phase-pra-produksi bg-phase-pra-produksi-bg",
  PRODUKSI_LIVE: "border-t-4 border-phase-produksi-live bg-phase-produksi-live-bg",
  PASCA_PRODUKSI: "border-t-4 border-phase-pasca-produksi bg-phase-pasca-produksi-bg",
};

function formatRecordingDate(date: Date | null): string | null {
  if (!date) return null;
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(
    date,
  );
}

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
          const phase = STAGE_TO_PHASE[stage];
          const episodesInStage = episodes.filter((episode) => episode.stage === stage);
          return (
            <div key={stage} className="w-64 shrink-0 rounded-lg bg-slate-50 shadow-sm">
              <div className={`flex items-center justify-between rounded-t-md px-3 py-2 ${COLUMN_HEADER_STYLE[phase]}`}>
                <h2 className="text-sm font-semibold text-slate-800">{STAGE_LABELS[stage]}</h2>
                <span className="rounded-full bg-white/70 px-1.5 py-0.5 text-xs font-medium text-slate-600">
                  {episodesInStage.length}
                </span>
              </div>
              <ul className="space-y-2 p-3">
                {episodesInStage.map((episode) => {
                  const recordingDate = formatRecordingDate(episode.recordingScheduledAt);
                  return (
                    <li key={episode.id}>
                      <Link
                        href={`/episodes/${episode.id}`}
                        className={`block rounded-md border-l-4 bg-white p-2.5 text-sm shadow-sm transition-shadow hover:shadow-md ${
                          phase === "PRA_PRODUKSI"
                            ? "border-phase-pra-produksi"
                            : phase === "PRODUKSI_LIVE"
                              ? "border-phase-produksi-live"
                              : "border-phase-pasca-produksi"
                        }`}
                      >
                        <p className="font-medium text-slate-900">{episode.title}</p>
                        {recordingDate && (
                          <p className="mt-1 text-xs text-slate-500">🗓 {recordingDate}</p>
                        )}
                      </Link>
                    </li>
                  );
                })}
                {episodesInStage.length === 0 && <li className="text-sm text-slate-400">—</li>}
              </ul>
            </div>
          );
        })}
      </div>
      <PhaseLegend />
    </main>
  );
}
