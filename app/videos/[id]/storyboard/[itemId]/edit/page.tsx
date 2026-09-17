import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { updateStoryboardFrameAction } from "../../actions";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { BUTTON_PRIMARY, BUTTON_SECONDARY, FIELD_GROUP, FORM, H1, INPUT, LABEL, PAGE } from "@/lib/ui-classes";

export default async function EditStoryboardFramePage({
  params,
}: {
  params: Promise<{ id: string; itemId: string }>;
}) {
  await requireSession();
  const { id: projectId, itemId } = await params;

  const item = await prisma.storyboardFrame.findUnique({ where: { id: itemId } });
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
          { label: "Storyboard", href: `/videos/${projectId}/storyboard` },
          { label: "Edit Frame" },
        ]}
      />
      <h1 className={H1}>Edit Frame</h1>
      <form action={updateStoryboardFrameAction.bind(null, projectId, item.id)} className={FORM}>
        <div className={FIELD_GROUP}>
          <label htmlFor="driveUrl" className={LABEL}>
            Link Google Drive
          </label>
          <input
            id="driveUrl"
            name="driveUrl"
            type="url"
            required
            defaultValue={item.driveUrl}
            className={INPUT}
          />
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
          <Link href={`/videos/${projectId}/storyboard`} className={BUTTON_SECONDARY}>
            Batal
          </Link>
        </div>
      </form>
    </main>
  );
}
