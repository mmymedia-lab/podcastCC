import Link from "next/link";
import { requireSession, resolveUserId } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getWorkspaceSettings } from "@/lib/workspace-settings";
import { dismissOnboardingAction } from "./actions";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";
import { CARD, PAGE } from "@/lib/ui-classes";

interface NavItem {
  href: string;
  label: string;
  hint: string;
}

interface NavSection {
  title: string;
  description: string;
  items: NavItem[];
}

// Podcast (Episode) and Video (Project) are two independent production
// pipelines — separate stages, separate roles, mostly separate features
// (see PRD.md) — grouped here as their own sections instead of one flat
// list, so which "world" a link belongs to is obvious at a glance. Settings
// and Pengguna apply to the whole workspace, not to either pipeline, so
// they get a third, neutral section rather than being folded into either.
function buildNavSections(isTimMode: boolean): NavSection[] {
  return [
    {
      title: "🎙 Podcast",
      description: "Bank Tema, episode, host, dan alur produksinya",
      items: [
        { href: "/bank-tema", label: "Bank Tema", hint: "Kumpulan ide topik episode" },
        { href: "/episodes", label: "Episode", hint: "Semua episode & tahapnya" },
        { href: "/hosts", label: "Host", hint: "Roster host/moderator" },
        ...(isTimMode
          ? [{ href: "/board", label: "Board", hint: "Kanban semua episode per tahap" }]
          : []),
      ],
    },
    {
      title: "🎬 Video",
      description: "Proyek produksi video dan alur produksinya",
      items: [
        { href: "/videos", label: "Video Project", hint: "Semua proyek video & tahapnya" },
      ],
    },
    {
      title: "⚙️ Workspace",
      description: "Berlaku untuk seluruh workspace, bukan spesifik Podcast/Video",
      items: [
        { href: "/settings", label: "Pengaturan Workspace", hint: "Mode Solo/Tim, API key Gemini" },
        { href: "/users", label: "Pengguna", hint: "Kelola akun pengguna" },
      ],
    },
  ];
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ panduan?: string }>;
}) {
  const session = await requireSession();
  const settings = await getWorkspaceSettings();
  const { panduan } = await searchParams;

  const userId = await resolveUserId(session);
  const user = userId
    ? await prisma.user.findUnique({ where: { id: userId }, select: { hasSeenOnboarding: true } })
    : null;
  const showOnboarding = panduan === "1" || !user?.hasSeenOnboarding;

  const sections = buildNavSections(settings.mode === "TIM");

  return (
    <main className={PAGE}>
      <OnboardingWizard initialOpen={showOnboarding} onFinishAction={dismissOnboardingAction} />
      <h1 className="mt-2 mb-1 text-2xl font-semibold tracking-tight text-slate-900">Dashboard</h1>
      <p className="mb-6 text-sm text-slate-500">Masuk sebagai {session.user?.email}</p>

      {sections.map((section) => (
        <section key={section.title} className="mb-8">
          <h2 className="mb-1 text-lg font-semibold text-slate-900">{section.title}</h2>
          <p className="mb-3 text-sm text-slate-500">{section.description}</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {section.items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`${CARD} block transition-shadow hover:shadow-md`}
              >
                <p className="font-medium text-slate-900">{item.label}</p>
                <p className="text-sm text-slate-500">{item.hint}</p>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </main>
  );
}
