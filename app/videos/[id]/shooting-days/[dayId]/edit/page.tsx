import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { updateShootingDayAction } from "../../actions";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { BUTTON_PRIMARY, BUTTON_SECONDARY, FIELD_GROUP, FORM, H1, INPUT, LABEL, PAGE } from "@/lib/ui-classes";

function toDateInputValue(date: Date | null): string {
  if (!date) return "";
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export default async function EditShootingDayPage({
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

  return (
    <main className={PAGE}>
      <Breadcrumb
        items={[
          { label: "Beranda", href: "/dashboard" },
          { label: "Video", href: "/videos" },
          { label: project.title, href: `/videos/${projectId}` },
          { label: "Hari Syuting", href: `/videos/${projectId}/shooting-days` },
          { label: "Edit" },
        ]}
      />
      <h1 className={H1}>Edit Hari Syuting</h1>
      <form action={updateShootingDayAction.bind(null, projectId, day.id)} className={FORM}>
        <div className={FIELD_GROUP}>
          <label htmlFor="scheduledDate" className={LABEL}>
            Tanggal
          </label>
          <input
            id="scheduledDate"
            name="scheduledDate"
            type="date"
            defaultValue={toDateInputValue(day.scheduledDate)}
            className={INPUT}
          />
        </div>
        <div className={FIELD_GROUP}>
          <label htmlFor="callTime" className={LABEL}>
            Call Time
          </label>
          <input id="callTime" name="callTime" defaultValue={day.callTime ?? ""} className={INPUT} />
        </div>
        <div className={FIELD_GROUP}>
          <label htmlFor="location" className={LABEL}>
            Lokasi
          </label>
          <input id="location" name="location" defaultValue={day.location ?? ""} className={INPUT} />
        </div>
        <div className={FIELD_GROUP}>
          <label htmlFor="sceneSchedule" className={LABEL}>
            Jadwal Scene Hari Ini
          </label>
          <input
            id="sceneSchedule"
            name="sceneSchedule"
            defaultValue={day.sceneSchedule ?? ""}
            className={INPUT}
          />
        </div>
        <div className={FIELD_GROUP}>
          <label htmlFor="wrapEstimate" className={LABEL}>
            Estimasi Wrap
          </label>
          <input
            id="wrapEstimate"
            name="wrapEstimate"
            defaultValue={day.wrapEstimate ?? ""}
            className={INPUT}
          />
        </div>
        <div className={FIELD_GROUP}>
          <label htmlFor="notes" className={LABEL}>
            Catatan
          </label>
          <input id="notes" name="notes" defaultValue={day.notes ?? ""} className={INPUT} />
        </div>
        <div className="flex gap-2">
          <button type="submit" className={BUTTON_PRIMARY}>
            Simpan
          </button>
          <Link href={`/videos/${projectId}/shooting-days/${day.id}`} className={BUTTON_SECONDARY}>
            Batal
          </Link>
        </div>
      </form>
    </main>
  );
}
