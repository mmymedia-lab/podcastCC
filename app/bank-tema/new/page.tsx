import { requireSession } from "@/lib/session";
import { createThemeIdeaAction } from "../actions";
import { BUTTON_PRIMARY, FIELD_GROUP, FORM, H1, INPUT, LABEL, PAGE, TEXTAREA } from "@/lib/ui-classes";

export default async function NewThemeIdeaPage() {
  await requireSession();

  return (
    <main className={PAGE}>
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
        <button type="submit" className={BUTTON_PRIMARY}>
          Simpan
        </button>
      </form>
    </main>
  );
}
