import Link from "next/link";
import { requireSession } from "@/lib/session";
import { createThemeIdeaAction } from "../actions";
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

export default async function NewThemeIdeaPage() {
  await requireSession();

  return (
    <main className={PAGE}>
      <Breadcrumb
        items={[
          { label: "Beranda", href: "/dashboard" },
          { label: "Bank Tema", href: "/bank-tema" },
          { label: "Tambah Ide" },
        ]}
      />
      <h1 className={H1}>Tambah Ide Topik</h1>
      <form action={createThemeIdeaAction} className={FORM}>
        <div className={FIELD_GROUP}>
          <label htmlFor="title" className={LABEL}>
            Judul
          </label>
          <input id="title" name="title" required className={INPUT} />
        </div>
        <div className={FIELD_GROUP}>
          <label htmlFor="description" className={LABEL}>
            Deskripsi
          </label>
          <textarea id="description" name="description" className={TEXTAREA} />
        </div>
        <div className={FIELD_GROUP}>
          <label htmlFor="tags" className={LABEL}>
            Tag (pisahkan dengan koma)
          </label>
          <input id="tags" name="tags" placeholder="mis. teknologi, edukasi" className={INPUT} />
        </div>
        <div className="flex gap-2">
          <button type="submit" className={BUTTON_PRIMARY}>
            Simpan
          </button>
          <Link href="/bank-tema" className={BUTTON_SECONDARY}>
            Batal
          </Link>
        </div>
      </form>
    </main>
  );
}
