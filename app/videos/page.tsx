import { requireSession } from "@/lib/session";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { EMPTY_STATE, H1, PAGE } from "@/lib/ui-classes";

// Milestone 0 of the video-production module (Project/ProjectStage/
// ProjectRole exist in the schema, see prisma/schema.prisma) — CRUD lands
// in the next milestone. This stub only exists so the "Video" nav entry
// on the dashboard doesn't 404 in the meantime.
export default async function VideosPage() {
  await requireSession();

  return (
    <main className={PAGE}>
      <Breadcrumb items={[{ label: "Beranda", href: "/dashboard" }, { label: "Video" }]} />
      <h1 className={H1}>Video</h1>
      <p className={EMPTY_STATE}>
        Fitur pelacakan proyek video segera hadir — dari ide, pra-produksi, produksi, sampai
        pasca-produksi dan distribusi.
      </p>
    </main>
  );
}
