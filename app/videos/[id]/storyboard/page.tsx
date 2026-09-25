import { notFound } from "next/navigation";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import {
  createStoryboardFrameAction,
  deleteStoryboardFrameAction,
  moveStoryboardFrameAction,
} from "./actions";
import { AiStoryboardPromptAssist } from "./ai-storyboard-prompt-assist";
import { StoryboardGallery } from "./storyboard-gallery";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { DriveFolderNotice } from "@/components/ui/DriveFolderNotice";
import {
  BUTTON_PRIMARY,
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

      <DriveFolderNotice driveFolderUrl={project.driveFolderUrl} />

      <AiStoryboardPromptAssist />

      {items.length === 0 ? (
        <p className={EMPTY_STATE}>Belum ada frame storyboard.</p>
      ) : (
        <StoryboardGallery
          projectId={projectId}
          items={items}
          moveAction={moveStoryboardFrameAction}
          deleteAction={deleteStoryboardFrameAction}
        />
      )}

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
