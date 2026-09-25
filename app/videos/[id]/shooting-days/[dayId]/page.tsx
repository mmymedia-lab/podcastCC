import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { deleteShootingDayAction } from "../actions";
import { createContinuityNoteAction, deleteContinuityNoteAction } from "./actions";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import {
  BUTTON_DANGER,
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
  PAGE_WIDE,
} from "@/lib/ui-classes";

function formatScheduledDate(date: Date | null): string {
  if (!date) return "Tanggal belum ditentukan";
  return date.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

function formatNoteTime(date: Date): string {
  return date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}

export default async function ShootingDayDetailPage({
  params,
}: {
  params: Promise<{ id: string; dayId: string }>;
}) {
  await requireSession();
  const { id: projectId, dayId } = await params;

  const day = await prisma.shootingDay.findUnique({ where: { id: dayId } });
  if (!day || day.projectId !== projectId) notFound();

  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) notFound();

  const notes = await prisma.continuityNote.findMany({
    where: { shootingDayId: dayId },
    orderBy: { createdAt: "asc" },
  });

  return (
    <main className={PAGE_WIDE}>
      <Breadcrumb
        items={[
          { label: "Beranda", href: "/dashboard" },
          { label: "Video", href: "/videos" },
          { label: project.title, href: `/videos/${projectId}` },
          { label: "Hari Syuting", href: `/videos/${projectId}/shooting-days` },
          { label: formatScheduledDate(day.scheduledDate) },
        ]}
      />
      <h1 className={H1}>{formatScheduledDate(day.scheduledDate)}</h1>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className={CARD}>
          <p className="mb-2 text-sm font-medium text-slate-700">Call Sheet</p>
          <dl className="space-y-1 text-sm text-slate-600">
            <div>
              <dt className="inline font-medium text-slate-700">Call time: </dt>
              <dd className="inline">{day.callTime ?? "—"}</dd>
            </div>
            <div>
              <dt className="inline font-medium text-slate-700">Lokasi: </dt>
              <dd className="inline">{day.location ?? "—"}</dd>
            </div>
            <div>
              <dt className="inline font-medium text-slate-700">Jadwal scene: </dt>
              <dd className="inline">{day.sceneSchedule ?? "—"}</dd>
            </div>
            <div>
              <dt className="inline font-medium text-slate-700">Estimasi wrap: </dt>
              <dd className="inline">{day.wrapEstimate ?? "—"}</dd>
            </div>
            {day.notes && (
              <div>
                <dt className="inline font-medium text-slate-700">Catatan: </dt>
                <dd className="inline">{day.notes}</dd>
              </div>
            )}
          </dl>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href={`/videos/${projectId}/shooting-days/${day.id}/edit`} className={BUTTON_SECONDARY}>
              Edit
            </Link>
            <form action={deleteShootingDayAction.bind(null, projectId, day.id)}>
              <button type="submit" className={BUTTON_DANGER}>
                Hapus Hari Ini
              </button>
            </form>
          </div>
        </div>

        <div className={CARD}>
          <p className="mb-3 text-sm font-medium text-slate-700">Continuity Log</p>
          <ul className={CARD_LIST}>
            {notes.map((note) => (
              <li key={note.id} className="rounded-md border border-slate-200 p-3">
                <p className="text-sm text-slate-900">
                  {note.slate && <span className="font-medium">Slate {note.slate} </span>}
                  {note.takeNumber !== null && <span className="font-medium">Take {note.takeNumber} </span>}
                  {note.isGood ? (
                    <span className="text-emerald-700">✓ OK</span>
                  ) : (
                    <span className="text-danger-700">✗ NG</span>
                  )}
                  <span className="ml-2 text-xs font-normal text-slate-400">
                    {formatNoteTime(note.createdAt)}
                  </span>
                </p>
                <p className="mt-1 whitespace-pre-wrap text-sm text-slate-600">{note.notes}</p>
                <form
                  action={deleteContinuityNoteAction.bind(null, projectId, dayId, note.id)}
                  className="mt-2"
                >
                  <button type="submit" className={BUTTON_DANGER}>
                    Hapus
                  </button>
                </form>
              </li>
            ))}
            {notes.length === 0 && <p className={EMPTY_STATE}>Belum ada catatan kontinuitas.</p>}
          </ul>

          <form
            action={createContinuityNoteAction.bind(null, projectId, dayId)}
            className={`${FORM} mt-4`}
          >
            <div className="grid grid-cols-2 gap-2">
              <div className={FIELD_GROUP}>
                <label htmlFor="slate" className={LABEL}>
                  Slate
                </label>
                <input id="slate" name="slate" className={INPUT} />
              </div>
              <div className={FIELD_GROUP}>
                <label htmlFor="takeNumber" className={LABEL}>
                  Take
                </label>
                <input id="takeNumber" name="takeNumber" type="number" min={1} className={INPUT} />
              </div>
            </div>
            <div className={FIELD_GROUP}>
              <label htmlFor="notes" className={LABEL}>
                Catatan
              </label>
              <input id="notes" name="notes" required className={INPUT} />
            </div>
            <div className={FIELD_GROUP}>
              <label htmlFor="isGood" className="flex items-center gap-2 text-sm text-slate-700">
                <input id="isGood" type="checkbox" name="isGood" />
                Take ini OK (bukan NG)
              </label>
            </div>
            <button type="submit" className={BUTTON_PRIMARY}>
              Tambah
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
