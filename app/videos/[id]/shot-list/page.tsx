import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { createShotListItemAction, deleteShotListItemAction, moveShotListItemAction } from "./actions";
import { AiShotListAssist } from "./ai-shot-list-assist";
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

export default async function ShotListPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireSession();
  const { id: projectId } = await params;

  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) notFound();

  const items = await prisma.shotListItem.findMany({
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
          { label: "Shot List" },
        ]}
      />
      <h1 className={H1}>Shot List: {project.title}</h1>

      <AiShotListAssist projectId={projectId} projectTitle={project.title} />

      <ol className={CARD_LIST}>
        {items.map((item, index) => (
          <li key={item.id} className={CARD}>
            <p className="font-medium text-slate-900">
              Shot {index + 1}: {item.description}
            </p>
            <p className="mt-1 text-sm text-slate-600">
              {item.angle && <>Angle: {item.angle} · </>}
              {item.lens && <>Lens: {item.lens} · </>}
              Estimasi {item.estimatedMinutes} menit
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <form action={moveShotListItemAction.bind(null, projectId, item.id, "up")}>
                <button
                  type="submit"
                  disabled={index === 0}
                  aria-label="Pindahkan shot ke atas"
                  className={`${BUTTON_GHOST} disabled:opacity-40`}
                >
                  ↑
                </button>
              </form>
              <form action={moveShotListItemAction.bind(null, projectId, item.id, "down")}>
                <button
                  type="submit"
                  disabled={index === items.length - 1}
                  aria-label="Pindahkan shot ke bawah"
                  className={`${BUTTON_GHOST} disabled:opacity-40`}
                >
                  ↓
                </button>
              </form>
              <Link href={`/videos/${projectId}/shot-list/${item.id}/edit`} className={BUTTON_SECONDARY}>
                Edit
              </Link>
              <form action={deleteShotListItemAction.bind(null, projectId, item.id)}>
                <button type="submit" className={BUTTON_DANGER}>
                  Hapus
                </button>
              </form>
            </div>
          </li>
        ))}
        {items.length === 0 && <p className={EMPTY_STATE}>Belum ada shot.</p>}
      </ol>

      <h2 className={H2}>Tambah Shot</h2>
      <form action={createShotListItemAction.bind(null, projectId)} className={FORM}>
        <div className={FIELD_GROUP}>
          <label htmlFor="description" className={LABEL}>
            Deskripsi
          </label>
          <input id="description" name="description" required className={INPUT} />
        </div>
        <div className={FIELD_GROUP}>
          <label htmlFor="angle" className={LABEL}>
            Angle
          </label>
          <input id="angle" name="angle" placeholder="mis. Wide, Close-up" className={INPUT} />
        </div>
        <div className={FIELD_GROUP}>
          <label htmlFor="lens" className={LABEL}>
            Lens
          </label>
          <input id="lens" name="lens" placeholder="mis. 24mm" className={INPUT} />
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
            defaultValue={5}
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
