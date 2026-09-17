import Link from "next/link";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ProjectStage } from "@prisma/client";
import { STAGE_LABELS, STAGE_ORDER } from "./stages";
import { ProjectStageBadge } from "@/components/ui/ProjectStageBadge";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { BUTTON_PRIMARY, CARD, CARD_LIST, EMPTY_STATE, H1, PAGE } from "@/lib/ui-classes";

export default async function VideosPage({
  searchParams,
}: {
  searchParams: Promise<{ stage?: string }>;
}) {
  await requireSession();
  const { stage: rawStage } = await searchParams;
  const activeStage =
    rawStage && STAGE_ORDER.includes(rawStage as ProjectStage) ? (rawStage as ProjectStage) : undefined;

  const projects = await prisma.project.findMany({
    where: activeStage ? { stage: activeStage } : undefined,
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className={PAGE}>
      <Breadcrumb items={[{ label: "Beranda", href: "/dashboard" }, { label: "Video" }]} />
      <div className="mb-6 flex items-center justify-between">
        <h1 className={`${H1} mb-0 mt-0`}>Video</h1>
        <Link href="/videos/new" className={BUTTON_PRIMARY}>
          + Tambah Proyek
        </Link>
      </div>

      <nav aria-label="Filter tahap" className="mb-4 flex flex-wrap gap-2">
        <Link
          href="/videos"
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            !activeStage ? "bg-primary-700 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          Semua
        </Link>
        {STAGE_ORDER.map((stage) => (
          <Link
            key={stage}
            href={`/videos?stage=${stage}`}
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              activeStage === stage
                ? "bg-primary-700 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {STAGE_LABELS[stage]}
          </Link>
        ))}
      </nav>

      <ul className={CARD_LIST}>
        {projects.map((project) => (
          <li key={project.id}>
            <Link
              href={`/videos/${project.id}`}
              className={`${CARD} flex items-center justify-between transition-shadow hover:shadow-md`}
            >
              <span className="font-medium text-slate-900">{project.title}</span>
              <ProjectStageBadge stage={project.stage} />
            </Link>
          </li>
        ))}
        {projects.length === 0 && (
          <p className={EMPTY_STATE}>
            Belum ada proyek video{activeStage ? ` di tahap "${STAGE_LABELS[activeStage]}"` : ""}.
          </p>
        )}
      </ul>
    </main>
  );
}
