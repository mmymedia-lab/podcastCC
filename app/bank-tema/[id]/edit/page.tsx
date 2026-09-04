import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { updateThemeIdeaAction } from "../../actions";
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

export default async function EditThemeIdeaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireSession();
  const { id } = await params;

  const idea = await prisma.themeIdea.findUnique({ where: { id } });
  if (!idea) notFound();

  return (
    <main className={PAGE}>
      <Breadcrumb
        items={[
          { label: "Beranda", href: "/dashboard" },
          { label: "Bank Tema", href: "/bank-tema" },
          { label: "Edit Ide" },
        ]}
      />
      <h1 className={H1}>Edit Ide Topik</h1>
      <form action={updateThemeIdeaAction.bind(null, idea.id)} className={FORM}>
        <div className={FIELD_GROUP}>
          <label htmlFor="title" className={LABEL}>
            Judul
          </label>
          <input id="title" name="title" defaultValue={idea.title} required className={INPUT} />
        </div>
        <div className={FIELD_GROUP}>
          <label htmlFor="description" className={LABEL}>
            Deskripsi
          </label>
          <textarea
            id="description"
            name="description"
            defaultValue={idea.description ?? ""}
            className={TEXTAREA}
          />
        </div>
        <div className={FIELD_GROUP}>
          <label htmlFor="tags" className={LABEL}>
            Tag (pisahkan dengan koma)
          </label>
          <input id="tags" name="tags" defaultValue={idea.tags.join(", ")} className={INPUT} />
        </div>
        <div className="flex gap-2">
          <button type="submit" className={BUTTON_PRIMARY}>
            Simpan
          </button>
          <Link href="/bank-tema" className={BUTTON_SECONDARY}>
            Batal
          </Link>
        </div>
      </form>
    </main>
  );
}
