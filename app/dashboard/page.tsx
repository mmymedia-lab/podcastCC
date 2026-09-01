import Link from "next/link";
import { requireSession } from "@/lib/session";
import { LogoutButton } from "./logout-button";

export default async function DashboardPage() {
  const session = await requireSession();

  return (
    <main>
      <h1>Dashboard</h1>
      <p>Masuk sebagai {session.user?.email}</p>
      <p>
        <Link href="/bank-tema">Bank Tema</Link>
      </p>
      <LogoutButton />
    </main>
  );
}
