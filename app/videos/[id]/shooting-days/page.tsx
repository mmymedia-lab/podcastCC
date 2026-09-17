import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { createShootingDayAction } from "./actions";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import {
  BUTTON_PRIMARY,
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

function formatScheduledDate(date: Date | null): string {
  if (!date) return "Tanggal belum ditentukan";
  return date.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

export default async function ShootingDaysPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireSession();
  const { id: projectId } = await params;

  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) notFound();

  const days = await prisma.shootingDay.findMany({
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
          { label: "Hari Syuting" },
        ]}
      />
      <h1 className={H1}>Hari Syuting: {project.title}</h1>

      <ol className={CARD_LIST}>
        {days.map((day, index) => (
          <li key={day.id}>
            <Link
              href={`/videos/${projectId}/shooting-days/${day.id}`}
              className={`${CARD} block transition-shadow hover:shadow-md`}
            >
              <p className="font-medium text-slate-900">
                Hari {index + 1}: {formatScheduledDate(day.scheduledDate)}
              </p>
              {day.location && <p className="mt-1 text-sm text-slate-600">{day.location}</p>}
            </Link>
          </li>
        ))}
        {days.length === 0 && <p className={EMPTY_STATE}>Belum ada hari syuting.</p>}
      </ol>

      <h2 className={H2}>Tambah Hari Syuting</h2>
      <form action={createShootingDayAction.bind(null, projectId)} className={FORM}>
        <div className={FIELD_GROUP}>
          <label htmlFor="scheduledDate" className={LABEL}>
            Tanggal
          </label>
          <input id="scheduledDate" name="scheduledDate" type="date" className={INPUT} />
        </div>
        <div className={FIELD_GROUP}>
          <label htmlFor="callTime" className={LABEL}>
            Call Time
          </label>
          <input id="callTime" name="callTime" placeholder="mis. 06:00" className={INPUT} />
        </div>
        <div className={FIELD_GROUP}>
          <label htmlFor="location" className={LABEL}>
            Lokasi
          </label>
          <input id="location" name="location" className={INPUT} />
        </div>
        <div className={FIELD_GROUP}>
          <label htmlFor="sceneSchedule" className={LABEL}>
            Jadwal Scene Hari Ini
          </label>
          <input id="sceneSchedule" name="sceneSchedule" placeholder="mis. Scene 1-3" className={INPUT} />
        </div>
        <div className={FIELD_GROUP}>
          <label htmlFor="wrapEstimate" className={LABEL}>
            Estimasi Wrap
          </label>
          <input id="wrapEstimate" name="wrapEstimate" placeholder="mis. 17:00" className={INPUT} />
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
