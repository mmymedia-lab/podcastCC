import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { updatePublishMetadataAction } from "./actions";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import {
  BUTTON_PRIMARY,
  CARD,
  FIELD_GROUP,
  FORM,
  H1,
  INPUT,
  LABEL,
  PAGE,
  TEXTAREA,
} from "@/lib/ui-classes";

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
    <main className={PAGE}>
      <Breadcrumb
        items={[
          { label: "Beranda", href: "/dashboard" },
          { label: "Episode", href: "/episodes" },
          { label: episode.title, href: `/episodes/${episodeId}` },
          { label: "Publish & Distribusi" },
        ]}
      />
      <h1 className={H1}>Publish & Distribusi: {episode.title}</h1>

      <form action={updatePublishMetadataAction.bind(null, episodeId)} className={FORM}>
        <div className={FIELD_GROUP}>
          <label htmlFor="publishTitle" className={LABEL}>
            Judul final
          </label>
          <input
            id="publishTitle"
            name="publishTitle"
            defaultValue={episode.publishTitle ?? ""}
            className={INPUT}
          />
        </div>
        <div className={FIELD_GROUP}>
          <label htmlFor="publishDescription" className={LABEL}>
            Deskripsi
          </label>
          <textarea
            id="publishDescription"
            name="publishDescription"
            defaultValue={episode.publishDescription ?? ""}
            className={TEXTAREA}
          />
        </div>
        <div className={FIELD_GROUP}>
          <label htmlFor="publishTags" className={LABEL}>
            Tag (pisahkan dengan koma)
          </label>
          <input
            id="publishTags"
            name="publishTags"
            defaultValue={episode.publishTags.join(", ")}
            className={INPUT}
          />
        </div>
        <button type="submit" className={BUTTON_PRIMARY}>
          Simpan
        </button>
      </form>

      <Link
        href={`/episodes/${episodeId}/checklist/publish`}
        className={`${CARD} mt-6 flex items-center justify-between transition-shadow hover:shadow-md`}
      >
        <span className="font-medium text-slate-900">Checklist Platform Tujuan</span>
        <span className="text-slate-400">→</span>
      </Link>
    </main>
  );
}
