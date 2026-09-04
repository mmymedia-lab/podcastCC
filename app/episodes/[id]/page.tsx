import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getWorkspaceSettings } from "@/lib/workspace-settings";
import { STAGE_LABELS, STAGE_ORDER } from "../stages";
import { updateEpisodeStageAction, updateRecordingScheduleAction } from "../actions";
import { StageBadge } from "@/components/ui/StageBadge";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
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

  const stageLinks = [
    { href: "outline", label: "Riset & Outline" },
    { href: "guest-questions", label: "Pertanyaan Narasumber" },
    { href: "checklist/pra-produksi", label: "Checklist Pra-Produksi" },
    { href: "guests", label: "Tamu & Narasumber" },
    { href: "rundown", label: "Rundown & Mode Eksekusi" },
    { href: "checklist/pasca-produksi", label: "Checklist Pasca-Produksi" },
    { href: "timestamps", label: "Timestamp / Chapter" },
    { href: "show-notes", label: "Show Notes" },
    { href: "publish", label: "Publish & Distribusi" },
    { href: "evaluation", label: "Evaluasi" },
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
      </div>

      <h2 className={H2}>Alur Episode</h2>
      <ol className="flex flex-wrap gap-2">
        {STAGE_ORDER.map((stage) => (
          <li key={stage}>
            {stage === episode.stage ? (
              <StageBadge stage={stage} />
            ) : (
              <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-500">
                {STAGE_LABELS[stage]}
              </span>
            )}
          </li>
        ))}
      </ol>

      <h2 className={H2}>Detail Tahap</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {stageLinks.map((link) => (
          <Link
            key={link.href}
            href={`/episodes/${episode.id}/${link.href}`}
            className={`${CARD} flex items-center justify-between transition-shadow hover:shadow-md`}
          >
            <span className="font-medium text-slate-900">{link.label}</span>
            <span className="text-slate-400">→</span>
          </Link>
        ))}
      </div>
    </main>
  );
}
