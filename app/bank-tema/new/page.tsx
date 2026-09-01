import { requireSession } from "@/lib/session";
import { createThemeIdeaAction } from "../actions";

export default async function NewThemeIdeaPage() {
  await requireSession();

  return (
    <main>
      <h1>Tambah Ide Topik</h1>
      <form action={createThemeIdeaAction}>
        <div>
          <label htmlFor="title">Judul</label>
          <input id="title" name="title" required />
        </div>
        <div>
          <label htmlFor="description">Deskripsi</label>
          <textarea id="description" name="description" />
        </div>
        <div>
          <label htmlFor="tags">Tag (pisahkan dengan koma)</label>
          <input id="tags" name="tags" placeholder="mis. teknologi, edukasi" />
        </div>
        <button type="submit">Simpan</button>
      </form>
    </main>
  );
}
