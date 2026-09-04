import Link from "next/link";
import { requireSession } from "@/lib/session";
import { createUserAction } from "../actions";
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

export default async function NewUserPage() {
  await requireSession();

  return (
    <main className={PAGE}>
      <p className="mb-2">
        <Link href="/users" className={BACK_LINK}>
          ← Pengguna
        </Link>
      </p>
      <h1 className={H1}>Tambah Pengguna</h1>

      <form action={createUserAction} className={FORM}>
        <div className={FIELD_GROUP}>
          <label htmlFor="email" className={LABEL}>
            Email
          </label>
          <input id="email" name="email" type="email" required className={INPUT} />
        </div>
        <div className={FIELD_GROUP}>
          <label htmlFor="name" className={LABEL}>
            Nama (opsional)
          </label>
          <input id="name" name="name" className={INPUT} />
        </div>
        <div className={FIELD_GROUP}>
          <label htmlFor="password" className={LABEL}>
            Password
          </label>
          <input id="password" name="password" type="password" required minLength={8} className={INPUT} />
          <p className={HELP_TEXT}>Minimal 8 karakter.</p>
        </div>
        <button type="submit" className={BUTTON_PRIMARY}>
          Tambah
        </button>
      </form>
    </main>
  );
}
