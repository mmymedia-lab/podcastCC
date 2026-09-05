import Link from "next/link";
import { notFound } from "next/navigation";
import { EpisodeStage } from "@prisma/client";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getWorkspaceSettings } from "@/lib/workspace-settings";
import { STAGE_LABELS, STAGE_ORDER } from "../stages";
import { PHASE_BADGE_STYLE, PHASE_BORDER_STYLE, STAGE_TO_PHASE } from "../phases";
import { updateEpisodeHostAction, updateEpisodeStageAction, updateRecordingScheduleAction } from "../actions";
import { StageBadge } from "@/components/ui/StageBadge";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { PhaseLegend } from "@/components/ui/PhaseLegend";
import { BUTTON_PRIMARY, CARD, FIELD_GROUP, H1, H2, INPUT, LABEL, PAGE_WIDE } from "@/lib/ui-classes";

function toDatetimeLocalValue(date: Date | null): string {
  if (!date) return "";
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;
}

export default async function EpisodeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireSession();
  const { id } = await params;

  const episode = await prisma.episode.findUnique({ where: { id } });
  if (!episode) notFound();

  const settings = await getWorkspaceSettings();
  const hosts = await prisma.host.findMany({ orderBy: { name: "asc" } });

  // `stage` here is whichever stage each sub-page's own edit actions gate
  // on (see requireEditableStage()/canEditStage() calls in each section's
  // actions.ts) — that's what its card's phase color reflects. "Peran Tim"
  // has no stage: it's team management, not a production step.
  const stageLinks: { href: string; label: string; stage?: EpisodeStage }[] = [
    { href: "outline", label: "Riset & Outline", stage: "RISET_OUTLINE" },
    { href: "guest-questions", label: "Pertanyaan Narasumber", stage: "RISET_OUTLINE" },
    { href: "checklist/pra-produksi", label: "Checklist Pra-Produksi", stage: "PRA_PRODUKSI" },
    { href: "guests", label: "Tamu & Narasumber", stage: "PRA_PRODUKSI" },
    { href: "rundown", label: "Rundown & Mode Eksekusi", stage: "PANDUAN_EKSEKUSI" },
    { href: "checklist/pasca-produksi", label: "Checklist Pasca-Produksi", stage: "PASCA_PRODUKSI" },
    { href: "timestamps", label: "Timestamp / Chapter", stage: "PASCA_PRODUKSI" },
    { href: "show-notes", label: "Show Notes", stage: "PASCA_PRODUKSI" },
    { href: "publish", label: "Publish & Distribusi", stage: "PUBLISH_DISTRIBUSI" },
    { href: "evaluation", label: "Evaluasi", stage: "EVALUASI" },
    ...(settings.mode === "TIM" ? [{ href: "roles", label: "Peran Tim" }] : []),
  ];

  return (
    <main className={PAGE_WIDE}>
      <Breadcrumb
        items={[
          { label: "Beranda", href: "/dashboard" },
          { label: "Episode", href: "/episodes" },
          { label: episode.title },
        ]}
      />
      <div className="mb-6">
        <h1 className={`${H1} mb-2`}>{episode.title}</h1>
        <StageBadge stage={episode.stage} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <form action={updateEpisodeStageAction.bind(null, episode.id)} className={CARD}>
          <label htmlFor="stage" className={LABEL}>
            Ubah tahap
          </label>
          <select
            id="stage"
            name="stage"
            defaultValue={episode.stage}
            className={`${INPUT} mb-3`}
          >
            {STAGE_ORDER.map((stage) => (
              <option key={stage} value={stage}>
                {STAGE_LABELS[stage]}
              </option>
            ))}
          </select>
          <button type="submit" className={BUTTON_PRIMARY}>
            Simpan
          </button>
        </form>

        <form action={updateRecordingScheduleAction.bind(null, episode.id)} className={CARD}>
          <label htmlFor="recordingScheduledAt" className={LABEL}>
            Jadwal rekaman
          </label>
          <input
            id="recordingScheduledAt"
            name="recordingScheduledAt"
            type="datetime-local"
            defaultValue={toDatetimeLocalValue(episode.recordingScheduledAt)}
            className={`${INPUT} mb-3`}
          />
          <button type="submit" className={BUTTON_PRIMARY}>
            Simpan
          </button>
        </form>

        <form action={updateEpisodeHostAction.bind(null, episode.id)} className={CARD}>
          <label htmlFor="hostId" className={LABEL}>
            Host episode ini
          </label>
          <select id="hostId" name="hostId" defaultValue={episode.hostId ?? ""} className={`${INPUT} mb-3`}>
            <option value="">Belum ditentukan</option>
            {hosts.map((host) => (
              <option key={host.id} value={host.id}>
                {host.name}
              </option>
            ))}
          </select>
          <button type="submit" className={BUTTON_PRIMARY}>
            Simpan
          </button>
        </form>
      </div>

      <h2 className={H2}>Alur Episode</h2>
      <ol className="flex flex-wrap gap-2">
        {STAGE_ORDER.map((stage) => (
          <li key={stage}>
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${PHASE_BADGE_STYLE[STAGE_TO_PHASE[stage]]} ${
                stage === episode.stage ? "ring-2 ring-offset-1 ring-slate-400" : "opacity-60"
              }`}
            >
              {STAGE_LABELS[stage]}
            </span>
          </li>
        ))}
      </ol>

      <h2 className={H2}>Detail Tahap</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {stageLinks.map((link) => (
          <Link
            key={link.href}
            href={`/episodes/${episode.id}/${link.href}`}
            // Not built on the shared CARD constant: CARD's own
            // `border-slate-200` is a border-color utility of equal
            // specificity to the phase border-color utility below, and
            // (being unrelated to source order in this class list) it
            // sorts later in the generated stylesheet and silently wins —
            // so the accent color never actually rendered when combined
            // with CARD. Rebuilding the same visual recipe without that
            // conflicting class, matching how the Kanban cards (which
            // don't hit this conflict) already do it correctly.
            className={`flex items-center justify-between rounded-lg border-l-4 bg-white p-4 shadow-sm transition-shadow hover:shadow-md ${
              link.stage ? PHASE_BORDER_STYLE[STAGE_TO_PHASE[link.stage]] : "border-l-slate-200"
            }`}
          >
            <span className="font-medium text-slate-900">{link.label}</span>
            <span className="text-slate-400">→</span>
          </Link>
        ))}
      </div>
      <PhaseLegend />
    </main>
  );
}
