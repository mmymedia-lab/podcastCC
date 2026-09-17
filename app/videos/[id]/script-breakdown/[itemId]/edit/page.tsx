import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { updateScriptBreakdownAction } from "../../actions";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { BUTTON_PRIMARY, BUTTON_SECONDARY, FIELD_GROUP, FORM, H1, INPUT, LABEL, PAGE } from "@/lib/ui-classes";

export default async function EditScriptBreakdownPage({
  params,
}: {
  params: Promise<{ id: string; itemId: string }>;
}) {
  await requireSession();
  const { id: projectId, itemId } = await params;

  const item = await prisma.scriptBreakdown.findUnique({ where: { id: itemId } });
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
          { label: "Script Breakdown", href: `/videos/${projectId}/script-breakdown` },
          { label: "Edit Scene" },
        ]}
      />
      <h1 className={H1}>Edit Scene</h1>
      <form action={updateScriptBreakdownAction.bind(null, projectId, item.id)} className={FORM}>
        <div className={FIELD_GROUP}>
          <label htmlFor="location" className={LABEL}>
            Lokasi
          </label>
          <input id="location" name="location" required defaultValue={item.location} className={INPUT} />
        </div>
        <div className={FIELD_GROUP}>
          <label htmlFor="props" className={LABEL}>
            Properti
          </label>
          <input id="props" name="props" defaultValue={item.props ?? ""} className={INPUT} />
        </div>
        <div className={FIELD_GROUP}>
          <label htmlFor="cast" className={LABEL}>
            Cast
          </label>
          <input id="cast" name="cast" defaultValue={item.cast ?? ""} className={INPUT} />
        </div>
        <div className={FIELD_GROUP}>
          <label htmlFor="notes" className={LABEL}>
            Catatan
          </label>
          <input id="notes" name="notes" defaultValue={item.notes ?? ""} className={INPUT} />
        </div>
        <div className="flex gap-2">
          <button type="submit" className={BUTTON_PRIMARY}>
            Simpan
          </button>
          <Link href={`/videos/${projectId}/script-breakdown`} className={BUTTON_SECONDARY}>
            Batal
          </Link>
        </div>
      </form>
    </main>
  );
}
