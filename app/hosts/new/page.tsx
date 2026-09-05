import Link from "next/link";
import { requireSession } from "@/lib/session";
import { createHostAction } from "../actions";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import {
  BUTTON_PRIMARY,
  BUTTON_SECONDARY,
  FIELD_GROUP,
  FORM,
  H1,
  INPUT,
  LABEL,
  PAGE,
  TEXTAREA,
} from "@/lib/ui-classes";

export default async function NewHostPage() {
  await requireSession();

  return (
    <main className={PAGE}>
      <Breadcrumb
        items={[
          { label: "Beranda", href: "/dashboard" },
          { label: "Host", href: "/hosts" },
          { label: "Tambah Host" },
        ]}
      />
      <h1 className={H1}>Tambah Host</h1>

      <form action={createHostAction} className={FORM}>
        <div className={FIELD_GROUP}>
          <label htmlFor="name" className={LABEL}>
            Nama
          </label>
          <input id="name" name="name" required className={INPUT} />
        </div>
        <div className={FIELD_GROUP}>
          <label htmlFor="contact" className={LABEL}>
            Kontak (opsional)
          </label>
          <input id="contact" name="contact" placeholder="No. HP, email, dsb." className={INPUT} />
        </div>
        <div className={FIELD_GROUP}>
          <label htmlFor="bio" className={LABEL}>
            Bio (opsional)
          </label>
          <textarea id="bio" name="bio" className={TEXTAREA} />
        </div>
        <div className="flex gap-2">
          <button type="submit" className={BUTTON_PRIMARY}>
            Tambah
          </button>
          <Link href="/hosts" className={BUTTON_SECONDARY}>
            Batal
          </Link>
        </div>
      </form>
    </main>
  );
}
