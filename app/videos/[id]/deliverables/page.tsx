import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { createDeliverableAction, deleteDeliverableAction, toggleDeliverableAction } from "./actions";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import {
  BUTTON_DANGER,
  BUTTON_GHOST,
  BUTTON_PRIMARY,
  BUTTON_SECONDARY,
  CARD,
  CARD_LIST,
  EMPTY_STATE,
  FIELD_GROUP,
  FORM,
  H1,
  H2,
  INPUT,
  LABEL,
  PAGE,
} from "@/lib/ui-classes";

export default async function DeliverablesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireSession();
  const { id: projectId } = await params;

  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) notFound();

  const items = await prisma.deliverable.findMany({
    where: { projectId },
    orderBy: { order: "asc" },
  });

  return (
    <main className={PAGE}>
      <Breadcrumb
        items={[
          { label: "Beranda", href: "/dashboard" },
          { label: "Video", href: "/videos" },
          { label: project.title, href: `/videos/${projectId}` },
          { label: "Deliverables" },
        ]}
      />
      <h1 className={H1}>Deliverables: {project.title}</h1>

      <ul className={CARD_LIST}>
        {items.map((item) => (
          <li key={item.id} className={`${CARD} flex items-center gap-3`}>
            <form action={toggleDeliverableAction.bind(null, projectId, item.id)}>
              <button
                type="submit"
                aria-pressed={item.isDone}
                aria-label={
                  item.isDone ? `Tandai "${item.label}" belum selesai` : `Tandai "${item.label}" selesai`
                }
                className={`${BUTTON_GHOST} text-lg`}
              >
                {item.isDone ? "☑" : "☐"}
              </button>
            </form>
            <div className="flex-1">
              <span
                className={`text-sm ${item.isDone ? "text-slate-400 line-through" : "text-slate-900"}`}
              >
                {item.label}
              </span>
              {item.driveUrl && (
                <a
                  href={item.driveUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="block break-all text-xs text-primary-700 hover:underline"
                >
                  {item.driveUrl}
                </a>
              )}
            </div>
            <Link href={`/videos/${projectId}/deliverables/${item.id}/edit`} className={BUTTON_SECONDARY}>
              Edit
            </Link>
            <form action={deleteDeliverableAction.bind(null, projectId, item.id)}>
              <button type="submit" className={BUTTON_DANGER}>
                Hapus
              </button>
            </form>
          </li>
        ))}
        {items.length === 0 && <p className={EMPTY_STATE}>Belum ada deliverable.</p>}
      </ul>

      <h2 className={H2}>Tambah Deliverable</h2>
      <form action={createDeliverableAction.bind(null, projectId)} className={FORM}>
        <div className={FIELD_GROUP}>
          <label htmlFor="label" className={LABEL}>
            Nama Deliverable
          </label>
          <input id="label" name="label" required className={INPUT} />
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
            className={INPUT}
          />
        </div>
        <button type="submit" className={BUTTON_PRIMARY}>
          Tambah
        </button>
      </form>
    </main>
  );
}
