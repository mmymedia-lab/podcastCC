# Catatan Perubahan — Aksesibilitas Tombol Icon-Only

**Tanggal:** 2026-09-03
**Konteks:** Ditemukan saat testing manual menyeluruh (Outline, Pertanyaan Narasumber,
Checklist, Rundown) di deployment Podman server `yassalam`.

---

## Yang diperbaiki

4 file punya tombol **icon-only tanpa `aria-label`** dan target klik yang sangat kecil
(cuma sebesar karakter unicode-nya sendiri, tanpa padding):

| File | Tombol | Sebelum |
|---|---|---|
| `app/episodes/[id]/checklist/[category]/page.tsx` | `☐` / `☑` (toggle selesai) | Cuma `aria-pressed`, tanpa `aria-label` |
| `app/episodes/[id]/outline/page.tsx` | `↑` / `↓` (reorder) | Tanpa `aria-label` |
| `app/episodes/[id]/guest-questions/page.tsx` | `↑` / `↓` (reorder) | Tanpa `aria-label` |
| `app/episodes/[id]/rundown/page.tsx` | `↑` / `↓` (reorder) | Tanpa `aria-label` |

**Kenapa ini masalah:** screen reader cuma akan membacakan karakter unicode-nya
("kotak kosong", "panah atas") tanpa konteks apa yang tombol itu lakukan atau item mana
yang dipengaruhi. Target klik yang terlalu kecil juga menyulitkan pengguna dengan
gangguan motorik atau di layar sentuh.

## Perubahan yang diterapkan

Setiap tombol ditambahkan:
1. **`aria-label` deskriptif** — untuk toggle checklist, labelnya dinamis mengikuti
   nama item dan aksi yang akan terjadi (mis. `Tandai "Siapkan mic dan audio interface"
   selesai` / `... belum selesai`); untuk reorder, label statis per konteks halaman
   (mis. `Pindahkan poin bicara ke atas`).
2. **`minWidth`/`minHeight: 2.5rem`** — memperbesar target klik ke ~40px, tanpa mengubah
   desain visual lain (aplikasi ini masih pakai HTML default tanpa styling framework).

Tidak ada perubahan pada logic/behavior tombol — cuma atribut aksesibilitas dan ukuran
target klik.

## Verifikasi
- Build ulang image `podcastcc_app` berhasil.
- Redeploy via `systemctl --user restart podcastcc-app.service`.
- Dikonfirmasi langsung di production: `aria-label` muncul dengan benar dan dinamis
  sesuai state item (dicek lewat `document.querySelectorAll('button')` di browser),
  `minWidth` ter-computed 40px.

## Catatan tambahan: gangguan testing (BUKAN penyebab masalah ini)
Selama proses testing manual, ditemukan juga bahwa browser automation (Claude in
Chrome) sempat gagal mengklik banyak elemen di halaman-halaman ini — baik input teks
maupun tombol `↑↓`/`☐`. Root cause-nya viewport-mismatch di sisi browser lokal (Windows,
kemungkinan display scaling), **bukan** karena ukuran tombol yang kecil (masalah itu
sudah ada sebelum ukuran tombol diperbesar). Detail lengkap ada di
`AUTOMATION_TESTING_NOTES.md`. Ukuran target klik diperbesar di sini murni sebagai
perbaikan aksesibilitas yang memang seharusnya ada, bukan sebagai fix untuk masalah
automation tersebut.
