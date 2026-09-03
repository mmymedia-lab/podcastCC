import Link from "next/link";
import { requireSession } from "@/lib/session";
import { getWorkspaceSettings } from "@/lib/workspace-settings";
import { LogoutButton } from "./logout-button";
import { CARD, H1, PAGE } from "@/lib/ui-classes";

const NAV_ITEMS = [
  { href: "/bank-tema", label: "Bank Tema", hint: "Kumpulan ide topik episode" },
  { href: "/episodes", label: "Episode", hint: "Semua episode & tahapnya" },
  { href: "/settings", label: "Pengaturan Workspace", hint: "Mode Solo/Tim" },
];

export default async function DashboardPage() {
  const session = await requireSession();
  const settings = await getWorkspaceSettings();

  return (
    <main className={PAGE}>
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

      <div className="mt-8">
        <LogoutButton />
      </div>
    </main>
  );
}
