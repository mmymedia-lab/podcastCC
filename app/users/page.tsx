import Link from "next/link";
import { requireSession, resolveUserId } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { deleteUserAction } from "./actions";
import {
  BACK_LINK,
  BUTTON_DANGER,
  BUTTON_PRIMARY,
  BUTTON_SECONDARY,
  CARD,
  CARD_LIST,
  H1,
  PAGE,
} from "@/lib/ui-classes";

export default async function UsersPage() {
  const session = await requireSession();
  const currentUserId = await resolveUserId(session);

  const users = await prisma.user.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <main className={PAGE}>
      <p className="mb-2">
        <Link href="/settings" className={BACK_LINK}>
          ← Pengaturan
        </Link>
      </p>
      <div className="mb-6 flex items-center justify-between">
        <h1 className={`${H1} mb-0`}>Pengguna</h1>
        <Link href="/users/new" className={BUTTON_PRIMARY}>
          + Tambah Pengguna
        </Link>
      </div>

      <ul className={CARD_LIST}>
        {users.map((user) => (
          <li key={user.id} className={CARD}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium text-slate-900">
                  {user.name || user.email}
                  {user.id === currentUserId && (
                    <span className="ml-2 text-xs font-normal text-slate-400">(kamu)</span>
                  )}
                </p>
                <p className="text-sm text-slate-500">{user.email}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Link href={`/users/${user.id}/edit`} className={BUTTON_SECONDARY}>
                  Edit
                </Link>
                <form action={deleteUserAction.bind(null, user.id)}>
                  <button type="submit" disabled={user.id === currentUserId} className={`${BUTTON_DANGER} disabled:opacity-40`}>
                    Hapus
                  </button>
                </form>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
