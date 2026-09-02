import Link from "next/link";
import { requireSession } from "@/lib/session";
import { getWorkspaceSettings } from "@/lib/workspace-settings";
import { LogoutButton } from "./logout-button";

export default async function DashboardPage() {
  const session = await requireSession();
  const settings = await getWorkspaceSettings();

  return (
    <main>
      <h1>Dashboard</h1>
      <p>Masuk sebagai {session.user?.email}</p>
      <p>
        <Link href="/bank-tema">Bank Tema</Link>
      </p>
      <p>
        <Link href="/episodes">Episode</Link>
      </p>
      {settings.mode === "TIM" && (
        <p>
          <Link href="/board">Board</Link>
        </p>
      )}
      <p>
        <Link href="/settings">Pengaturan Workspace</Link>
      </p>
      <LogoutButton />
    </main>
  );
}
