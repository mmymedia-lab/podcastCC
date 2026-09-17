import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { updateDeliverableAction } from "../../actions";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { BUTTON_PRIMARY, BUTTON_SECONDARY, FIELD_GROUP, FORM, H1, INPUT, LABEL, PAGE } from "@/lib/ui-classes";

export default async function EditDeliverablePage({
  params,
}: {
  params: Promise<{ id: string; deliverableId: string }>;
}) {
  await requireSession();
  const { id: projectId, deliverableId } = await params;

  const item = await prisma.deliverable.findUnique({ where: { id: deliverableId } });
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
          { label: "Deliverables", href: `/videos/${projectId}/deliverables` },
          { label: "Edit Deliverable" },
        ]}
      />
      <h1 className={H1}>Edit Deliverable</h1>
      <form action={updateDeliverableAction.bind(null, projectId, item.id)} className={FORM}>
        <div className={FIELD_GROUP}>
          <label htmlFor="label" className={LABEL}>
            Nama Deliverable
          </label>
          <input id="label" name="label" required defaultValue={item.label} className={INPUT} />
        </div>
        <div className={FIELD_GROUP}>
          <label htmlFor="driveUrl" className={LABEL}>
            Link Google Drive (opsional)
          </label>
          <input
            id="driveUrl"
            name="driveUrl"
            type="url"
            placeholder="https://drive.google.com/..."
            defaultValue={item.driveUrl ?? ""}
            className={INPUT}
          />
        </div>
        <div className="flex gap-2">
          <button type="submit" className={BUTTON_PRIMARY}>
            Simpan
          </button>
          <Link href={`/videos/${projectId}/deliverables`} className={BUTTON_SECONDARY}>
            Batal
          </Link>
        </div>
      </form>
    </main>
  );
}
