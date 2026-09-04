import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { updateGuestQuestionAction } from "../../actions";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import {
  BUTTON_PRIMARY,
  BUTTON_SECONDARY,
  FIELD_GROUP,
  FORM,
  H1,
  LABEL,
  PAGE,
  TEXTAREA,
} from "@/lib/ui-classes";

export default async function EditGuestQuestionPage({
  params,
}: {
  params: Promise<{ id: string; itemId: string }>;
}) {
  await requireSession();
  const { id: episodeId, itemId } = await params;

  const item = await prisma.guestQuestion.findUnique({ where: { id: itemId } });
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
          { label: "Pertanyaan Narasumber", href: `/episodes/${episodeId}/guest-questions` },
          { label: "Edit Pertanyaan" },
        ]}
      />
      <h1 className={H1}>Edit Pertanyaan</h1>
      <form action={updateGuestQuestionAction.bind(null, episodeId, item.id)} className={FORM}>
        <div className={FIELD_GROUP}>
          <label htmlFor="content" className={LABEL}>
            Pertanyaan
          </label>
          <textarea id="content" name="content" defaultValue={item.content} required className={TEXTAREA} />
        </div>
        <div className="flex gap-2">
          <button type="submit" className={BUTTON_PRIMARY}>
            Simpan
          </button>
          <Link href={`/episodes/${episodeId}/guest-questions`} className={BUTTON_SECONDARY}>
            Batal
          </Link>
        </div>
      </form>
    </main>
  );
}
