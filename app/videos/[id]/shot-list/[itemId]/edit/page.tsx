import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { updateShotListItemAction } from "../../actions";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { BUTTON_PRIMARY, BUTTON_SECONDARY, FIELD_GROUP, FORM, H1, INPUT, LABEL, PAGE } from "@/lib/ui-classes";

export default async function EditShotListItemPage({
  params,
}: {
  params: Promise<{ id: string; itemId: string }>;
}) {
  await requireSession();
  const { id: projectId, itemId } = await params;

  const item = await prisma.shotListItem.findUnique({ where: { id: itemId } });
  if (!item || item.projectId !== projectId) notFound();

  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) notFound();

  return (
    <main className={PAGE}>
      <Breadcrumb
        items={[
          { label: "Beranda", href: "/dashboard" },
          { label: "Video", href: "/videos" },
          { label: project.title, href: `/videos/${projectId}` },
          { label: "Shot List", href: `/videos/${projectId}/shot-list` },
          { label: "Edit Shot" },
        ]}
      />
      <h1 className={H1}>Edit Shot</h1>
      <form action={updateShotListItemAction.bind(null, projectId, item.id)} className={FORM}>
        <div className={FIELD_GROUP}>
          <label htmlFor="description" className={LABEL}>
            Deskripsi
          </label>
          <input
            id="description"
            name="description"
            required
            defaultValue={item.description}
            className={INPUT}
          />
        </div>
        <div className={FIELD_GROUP}>
          <label htmlFor="angle" className={LABEL}>
            Angle
          </label>
          <input id="angle" name="angle" defaultValue={item.angle ?? ""} className={INPUT} />
        </div>
        <div className={FIELD_GROUP}>
          <label htmlFor="lens" className={LABEL}>
            Lens
          </label>
          <input id="lens" name="lens" defaultValue={item.lens ?? ""} className={INPUT} />
        </div>
        <div className={FIELD_GROUP}>
          <label htmlFor="estimatedMinutes" className={LABEL}>
            Estimasi durasi (menit)
          </label>
          <input
            id="estimatedMinutes"
            name="estimatedMinutes"
            type="number"
            min={1}
            defaultValue={item.estimatedMinutes}
            className={INPUT}
          />
        </div>
        <div className="flex gap-2">
          <button type="submit" className={BUTTON_PRIMARY}>
            Simpan
          </button>
          <Link href={`/videos/${projectId}/shot-list`} className={BUTTON_SECONDARY}>
            Batal
          </Link>
        </div>
      </form>
    </main>
  );
}
