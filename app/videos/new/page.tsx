import Link from "next/link";
import { requireSession } from "@/lib/session";
import { createProjectAction } from "../actions";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { BUTTON_PRIMARY, BUTTON_SECONDARY, FIELD_GROUP, FORM, H1, INPUT, LABEL, PAGE } from "@/lib/ui-classes";

export default async function NewProjectPage() {
  await requireSession();

  return (
    <main className={PAGE}>
      <Breadcrumb
        items={[
          { label: "Beranda", href: "/dashboard" },
          { label: "Video", href: "/videos" },
          { label: "Tambah Proyek" },
        ]}
      />
      <h1 className={H1}>Tambah Proyek Video</h1>
      <form action={createProjectAction} className={FORM}>
        <div className={FIELD_GROUP}>
          <label htmlFor="title" className={LABEL}>
            Judul
          </label>
          <input id="title" name="title" required className={INPUT} />
        </div>
        <div className="flex gap-2">
          <button type="submit" className={BUTTON_PRIMARY}>
            Simpan
          </button>
          <Link href="/videos" className={BUTTON_SECONDARY}>
            Batal
          </Link>
        </div>
      </form>
    </main>
  );
}
