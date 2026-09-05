import Link from "next/link";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { deleteHostAction } from "./actions";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import {
  BUTTON_DANGER,
  BUTTON_PRIMARY,
  BUTTON_SECONDARY,
  CARD,
  CARD_LIST,
  EMPTY_STATE,
  H1,
  PAGE,
} from "@/lib/ui-classes";

export default async function HostsPage() {
  await requireSession();

  const hosts = await prisma.host.findMany({ orderBy: { name: "asc" } });

  return (
    <main className={PAGE}>
      <Breadcrumb items={[{ label: "Beranda", href: "/dashboard" }, { label: "Host" }]} />
      <div className="mb-6 flex items-center justify-between">
        <h1 className={`${H1} mb-0`}>Host</h1>
        <Link href="/hosts/new" className={BUTTON_PRIMARY}>
          + Tambah Host
        </Link>
      </div>

      <ul className={CARD_LIST}>
        {hosts.map((host) => (
          <li key={host.id} className={CARD}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium text-slate-900">{host.name}</p>
                {host.contact && <p className="text-sm text-slate-500">{host.contact}</p>}
                {host.bio && <p className="mt-1 text-sm text-slate-600">{host.bio}</p>}
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-2">
                <Link href={`/hosts/${host.id}/edit`} className={BUTTON_SECONDARY}>
                  Edit
                </Link>
                <form action={deleteHostAction.bind(null, host.id)}>
                  <button type="submit" className={BUTTON_DANGER}>
                    Hapus
                  </button>
                </form>
              </div>
            </div>
          </li>
        ))}
        {hosts.length === 0 && <p className={EMPTY_STATE}>Belum ada host.</p>}
      </ul>
    </main>
  );
}
