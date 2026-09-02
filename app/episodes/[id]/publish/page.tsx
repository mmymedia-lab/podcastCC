import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { updatePublishMetadataAction } from "./actions";

export default async function PublishPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireSession();
  const { id: episodeId } = await params;

  const episode = await prisma.episode.findUnique({ where: { id: episodeId } });
  if (!episode) notFound();

  return (
    <main>
      <p>
        <Link href={`/episodes/${episodeId}`}>← {episode.title}</Link>
      </p>
      <h1>Publish & Distribusi: {episode.title}</h1>

      <form action={updatePublishMetadataAction.bind(null, episodeId)}>
        <div>
          <label htmlFor="publishTitle">Judul final</label>
          <input id="publishTitle" name="publishTitle" defaultValue={episode.publishTitle ?? ""} />
        </div>
        <div>
          <label htmlFor="publishDescription">Deskripsi</label>
          <textarea
            id="publishDescription"
            name="publishDescription"
            defaultValue={episode.publishDescription ?? ""}
          />
        </div>
        <div>
          <label htmlFor="publishTags">Tag (pisahkan dengan koma)</label>
          <input id="publishTags" name="publishTags" defaultValue={episode.publishTags.join(", ")} />
        </div>
        <button type="submit">Simpan</button>
      </form>

      <p>
        <Link href={`/episodes/${episodeId}/checklist/publish`}>Checklist Platform Tujuan →</Link>
      </p>
    </main>
  );
}
