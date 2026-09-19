import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import {
  createStoryboardFrameAction,
  deleteStoryboardFrameAction,
  moveStoryboardFrameAction,
} from "./actions";
import { AiStoryboardImageAssist } from "./ai-storyboard-image-assist";
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

export default async function StoryboardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireSession();
  const { id: projectId } = await params;

  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) notFound();

  const items = await prisma.storyboardFrame.findMany({
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
          { label: "Storyboard" },
        ]}
      />
      <h1 className={H1}>Storyboard: {project.title}</h1>

      <AiStoryboardImageAssist projectId={projectId} />

      <ol className={CARD_LIST}>
        {items.map((item, index) => (
          <li key={item.id} className={CARD}>
            <p className="font-medium text-slate-900">Shot {index + 1}</p>
            <a
              href={item.driveUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-1 block break-all text-sm text-primary-700 hover:underline"
            >
              {item.driveUrl}
            </a>
            {item.notes && <p className="mt-1 text-sm text-slate-600">{item.notes}</p>}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <form action={moveStoryboardFrameAction.bind(null, projectId, item.id, "up")}>
                <button
                  type="submit"
                  disabled={index === 0}
                  aria-label="Pindahkan frame ke atas"
                  className={`${BUTTON_GHOST} disabled:opacity-40`}
                >
                  ↑
                </button>
              </form>
              <form action={moveStoryboardFrameAction.bind(null, projectId, item.id, "down")}>
                <button
                  type="submit"
                  disabled={index === items.length - 1}
                  aria-label="Pindahkan frame ke bawah"
                  className={`${BUTTON_GHOST} disabled:opacity-40`}
                >
                  ↓
                </button>
              </form>
              <Link
                href={`/videos/${projectId}/storyboard/${item.id}/edit`}
                className={BUTTON_SECONDARY}
              >
                Edit
              </Link>
              <form action={deleteStoryboardFrameAction.bind(null, projectId, item.id)}>
                <button type="submit" className={BUTTON_DANGER}>
                  Hapus
                </button>
              </form>
            </div>
          </li>
        ))}
        {items.length === 0 && <p className={EMPTY_STATE}>Belum ada frame storyboard.</p>}
      </ol>

      <h2 className={H2}>Tambah Frame</h2>
      <form action={createStoryboardFrameAction.bind(null, projectId)} className={FORM}>
        <div className={FIELD_GROUP}>
          <label htmlFor="driveUrl" className={LABEL}>
            Link Google Drive
          </label>
          <input
            id="driveUrl"
            name="driveUrl"
            type="url"
            placeholder="https://drive.google.com/..."
            required
            className={INPUT}
          />
        </div>
        <div className={FIELD_GROUP}>
          <label htmlFor="notes" className={LABEL}>
            Catatan
          </label>
          <input id="notes" name="notes" className={INPUT} />
        </div>
        <button type="submit" className={BUTTON_PRIMARY}>
          Tambah
        </button>
      </form>
    </main>
  );
}
