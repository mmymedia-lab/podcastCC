import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { STAGE_LABELS, STAGE_ORDER } from "../stages";
import { updateEpisodeStageAction } from "../actions";

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
      <h2>Detail Tahap</h2>
      <p>
        <Link href={`/episodes/${episode.id}/checklist/pra-produksi`}>Checklist Pra-Produksi →</Link>
      </p>
      <p>
        <em>Outline, pertanyaan narasumber, dan tahap lain ditambahkan di issue-issue berikutnya.</em>
      </p>
    </main>
  );
}
