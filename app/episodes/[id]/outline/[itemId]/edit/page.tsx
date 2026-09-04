import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { updateOutlineItemAction } from "../../actions";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import {
  BUTTON_PRIMARY,
  BUTTON_SECONDARY,
  FIELD_GROUP,
  FORM,
  H1,
  INPUT,
  LABEL,
  PAGE,
  TEXTAREA,
} from "@/lib/ui-classes";

export default async function EditOutlineItemPage({
  params,
}: {
  params: Promise<{ id: string; itemId: string }>;
}) {
  await requireSession();
  const { id: episodeId, itemId } = await params;

  const item = await prisma.outlineItem.findUnique({ where: { id: itemId } });
  if (!item || item.episodeId !== episodeId) notFound();

  const episode = await prisma.episode.findUnique({ where: { id: episodeId } });
  if (!episode) notFound();

  return (
    <main className={PAGE}>
      <Breadcrumb
        items={[
          { label: "Beranda", href: "/dashboard" },
          { label: "Episode", href: "/episodes" },
          { label: episode.title, href: `/episodes/${episodeId}` },
          { label: "Riset & Outline", href: `/episodes/${episodeId}/outline` },
          { label: "Edit Poin Bicara" },
        ]}
      />
      <h1 className={H1}>Edit Poin Bicara</h1>
      <form action={updateOutlineItemAction.bind(null, episodeId, item.id)} className={FORM}>
        <div className={FIELD_GROUP}>
          <label htmlFor="content" className={LABEL}>
            Poin bicara
          </label>
          <textarea id="content" name="content" defaultValue={item.content} required className={TEXTAREA} />
        </div>
        <div className={FIELD_GROUP}>
          <label htmlFor="referenceUrl" className={LABEL}>
            Link referensi (opsional)
          </label>
          <input
            id="referenceUrl"
            name="referenceUrl"
            type="url"
            defaultValue={item.referenceUrl ?? ""}
            className={INPUT}
          />
        </div>
        <div className="flex gap-2">
          <button type="submit" className={BUTTON_PRIMARY}>
            Simpan
          </button>
          <Link href={`/episodes/${episodeId}/outline`} className={BUTTON_SECONDARY}>
            Batal
          </Link>
        </div>
      </form>
    </main>
  );
}
