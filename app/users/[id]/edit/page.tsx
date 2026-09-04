import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { updateUserAction } from "../../actions";
import {
  BACK_LINK,
  BUTTON_PRIMARY,
  FIELD_GROUP,
  FORM,
  H1,
  HELP_TEXT,
  INPUT,
  LABEL,
  PAGE,
} from "@/lib/ui-classes";

export default async function EditUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireSession();
  const { id } = await params;

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) notFound();

  return (
    <main className={PAGE}>
      <p className="mb-2">
        <Link href="/users" className={BACK_LINK}>
          ← Pengguna
        </Link>
      </p>
      <h1 className={H1}>Edit Pengguna</h1>

      <form action={updateUserAction.bind(null, user.id)} className={FORM}>
        <div className={FIELD_GROUP}>
          <label htmlFor="email" className={LABEL}>
            Email
          </label>
          <input id="email" name="email" type="email" defaultValue={user.email} required className={INPUT} />
        </div>
        <div className={FIELD_GROUP}>
          <label htmlFor="name" className={LABEL}>
            Nama (opsional)
          </label>
          <input id="name" name="name" defaultValue={user.name ?? ""} className={INPUT} />
        </div>
        <div className={FIELD_GROUP}>
          <label htmlFor="password" className={LABEL}>
            Password baru (opsional)
          </label>
          <input id="password" name="password" type="password" minLength={8} className={INPUT} />
          <p className={HELP_TEXT}>Kosongkan bila tidak ingin mengubah password.</p>
        </div>
        <button type="submit" className={BUTTON_PRIMARY}>
          Simpan
        </button>
      </form>
    </main>
  );
}
