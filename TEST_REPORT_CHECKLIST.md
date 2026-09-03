# Laporan Test — Checklist Pra-Produksi & Pasca-Produksi

**Tanggal:** 2026-09-02
**Environment:** Deploy Podman di server `yassalam`, `https://yassalam.taila2a4f3.ts.net:8443`
**Episode uji:** "Adab Menuntut Ilmu" (data tes, dibuat khusus untuk keperluan verifikasi ini)
**Metode:** Browser otomatis (Claude in Chrome), login sebagai `admin@yassalam.id`

---

## Ringkasan

**Status: LOLOS — tidak ada bug ditemukan** di kedua fitur checklist. Data antar tahap
terkonfirmasi terpisah dengan benar (item di Pra-Produksi tidak bocor ke Pasca-Produksi).

| Fitur | Tambah item | Toggle checkbox | Persisten setelah reload | Isolasi data antar-tahap |
|---|---|---|---|---|
| Checklist Pra-Produksi | ✅ | ✅ | ✅ | ✅ |
| Checklist Pasca-Produksi | ✅ | ✅ | ✅ | ✅ |

---

## Detail Test — Checklist Pra-Produksi

1. Buka `/episodes/{id}/checklist/pra-produksi` — halaman kosong ("Belum ada item checklist"), sesuai state awal.
2. Tambah item: "Siapkan mic dan audio interface" → tersimpan, muncul dengan checkbox `☐`.
3. Klik checkbox → berubah jadi `☑`.
4. Reload halaman penuh → checkbox tetap `☑` (persisten di database, bukan cuma state client).

Tidak ada anomali.

## Detail Test — Checklist Pasca-Produksi

1. Buka `/episodes/{id}/checklist/pasca-produksi` — halaman kosong, terpisah dari Pra-Produksi
   (item dari langkah sebelumnya tidak muncul di sini). ✅ Isolasi data antar-tahap benar.
2. Tambah item: "Edit audio via JS test" → tersimpan, muncul dengan checkbox `☐`.
3. Klik checkbox → berubah jadi `☑`.
4. Reload halaman penuh → checkbox tetap `☑`.

Tidak ada anomali di level aplikasi.

---

## Catatan penting untuk agen lain: gangguan automation, BUKAN bug aplikasi

Saat menguji halaman Pasca-Produksi, klik lewat automation (baik pakai koordinat pixel
maupun `ref` elemen) **gagal menyentuh field/tombol yang benar** — input tidak ter-focus,
teks tidak masuk, submit tidak terpicu. Root cause: `read_page` melaporkan viewport
`2048x983`, sedangkan screenshot yang diambil berukuran `1568x753` — ada mismatch skala
koordinat di sesi browser otomatis ini (kemungkinan dipicu oleh `resize_window` yang saya
panggil sebelumnya di sesi yang sama).

**Cara saya pastikan ini bukan bug aplikasi:** saya set value input via
`nativeInputValueSetter` + trigger event `input` (supaya React ikut update state), lalu
panggil `form.requestSubmit()` langsung lewat JavaScript — **berhasil normal, item
tersimpan ke database**. Ini membuktikan server action-nya sendiri berfungsi baik; yang
gagal murni klik/type dari lapisan automation, bukan logic aplikasi.

**Actionable untuk agen lain:** kalau menguji halaman ini lagi lewat browser automation
dan interaksi (click/type) tidak berefek sama sekali, cek dulu `read_page` untuk viewport
size vs ukuran screenshot — kalau tidak match, pakai `ref`-based click dari `read_page`/`find`
yang fresh (jangan reuse koordinat dari screenshot lama), atau fallback ke eksekusi JS
langsung seperti di atas untuk isolasi cepat apakah masalahnya di app atau di tooling.

---

## Yang belum ditest (di luar scope sesi ini)
- Checklist dengan item lebih dari satu / urutan tampil.
- Tombol "Hapus" item checklist (terlihat ada di UI, belum diklik/diverifikasi).
- Perilaku saat dua tahap (Pra & Pasca) checklist diakses bersamaan oleh 2 user berbeda (concurrency) — tidak relevan untuk single-admin testing saat ini.
