import Link from "next/link";
import { requireSession, resolveUserId } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getWorkspaceSettings } from "@/lib/workspace-settings";
import { dismissOnboardingAction } from "./actions";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";
import { CARD, H1, PAGE } from "@/lib/ui-classes";

const NAV_ITEMS = [
  { href: "/bank-tema", label: "Bank Tema", hint: "Kumpulan ide topik episode" },
  { href: "/episodes", label: "Episode", hint: "Semua episode & tahapnya" },
  { href: "/settings", label: "Pengaturan Workspace", hint: "Mode Solo/Tim, API key Gemini" },
  { href: "/users", label: "Pengguna", hint: "Kelola akun pengguna" },
];

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

  return (
    <main className={PAGE}>
      <OnboardingWizard initialOpen={showOnboarding} onFinishAction={dismissOnboardingAction} />
      <h1 className={H1}>Dashboard</h1>
      <p className="mb-6 text-sm text-slate-500">Masuk sebagai {session.user?.email}</p>

      <div className="grid gap-3 sm:grid-cols-2">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`${CARD} block transition-shadow hover:shadow-md`}
          >
            <p className="font-medium text-slate-900">{item.label}</p>
            <p className="text-sm text-slate-500">{item.hint}</p>
          </Link>
        ))}
        {settings.mode === "TIM" && (
          <Link href="/board" className={`${CARD} block transition-shadow hover:shadow-md`}>
            <p className="font-medium text-slate-900">Board</p>
            <p className="text-sm text-slate-500">Kanban semua episode per tahap</p>
          </Link>
        )}
      </div>
    </main>
  );
}
