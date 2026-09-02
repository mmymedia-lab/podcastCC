import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { STAGE_LABELS, STAGE_ORDER } from "../stages";
import { updateEpisodeStageAction, updateRecordingScheduleAction } from "../actions";

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

  return (
    <main>
      <h1>{episode.title}</h1>
      <p>
        Tahap saat ini: <strong>{STAGE_LABELS[episode.stage]}</strong>
      </p>

      <form action={updateEpisodeStageAction.bind(null, episode.id)}>
        <label htmlFor="stage">Ubah tahap</label>
        <select id="stage" name="stage" defaultValue={episode.stage}>
          {STAGE_ORDER.map((stage) => (
            <option key={stage} value={stage}>
              {STAGE_LABELS[stage]}
            </option>
          ))}
        </select>
        <button type="submit">Simpan</button>
      </form>

      <h2>Alur Episode</h2>
      <ol>
        {STAGE_ORDER.map((stage) => (
          <li key={stage}>
            {STAGE_LABELS[stage]}
            {stage === episode.stage && " (saat ini)"}
          </li>
        ))}
      </ol>

      <h2>Jadwal Rekaman</h2>
      <form action={updateRecordingScheduleAction.bind(null, episode.id)}>
        <label htmlFor="recordingScheduledAt">Tanggal & jam rekaman</label>
        <input
          id="recordingScheduledAt"
          name="recordingScheduledAt"
          type="datetime-local"
          defaultValue={toDatetimeLocalValue(episode.recordingScheduledAt)}
        />
        <button type="submit">Simpan</button>
      </form>

      <h2>Detail Tahap</h2>
      <p>
        <Link href={`/episodes/${episode.id}/outline`}>Riset & Outline →</Link>
      </p>
      <p>
        <Link href={`/episodes/${episode.id}/guest-questions`}>Pertanyaan Narasumber →</Link>
      </p>
      <p>
        <Link href={`/episodes/${episode.id}/checklist/pra-produksi`}>Checklist Pra-Produksi →</Link>
      </p>
      <p>
        <Link href={`/episodes/${episode.id}/guests`}>Tamu & Narasumber →</Link>
      </p>
      <p>
        <Link href={`/episodes/${episode.id}/rundown`}>Rundown & Mode Eksekusi →</Link>
      </p>
      <p>
        <em>Checklist pasca-produksi, publish, dan evaluasi ditambahkan di issue-issue berikutnya.</em>
      </p>
    </main>
  );
}
