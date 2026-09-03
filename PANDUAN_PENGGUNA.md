# Panduan Pengguna — Podcast Prep & Execution

Panduan singkat cara pakai aplikasi, dari ide episode sampai publish. Untuk detail teknis (deploy, arsitektur), lihat `README.md` dan `PRD.md`.

## 1. Login

Buka alamat aplikasi (URL Tailscale yang dikonfigurasi admin), lalu login dengan email & password yang diberikan admin. Belum punya akun? Minta admin buatkan lewat `ADMIN_EMAIL`/`ADMIN_PASSWORD` di server, atau lewat fitur invite di **Pengaturan** (mode Tim).

## 2. Pilih Mode: Solo atau Tim

Buka **Pengaturan** (`/settings`) sekali di awal:

- **Solo** — kamu pegang semua tahap sendiri, tidak ada pembatasan siapa-boleh-edit-apa.
- **Tim** — setiap episode punya peran **Producer / Host / Editor**. Producer bisa edit semua tahap; Host fokus di Bank Tema, Outline, Pra-Produksi, Panduan Eksekusi; Editor fokus di Pasca-Produksi & Publish. Semua orang tetap bisa **lihat** semua data, hanya beda siapa yang boleh **edit** tahap tertentu.

Ganti mode kapan saja tanpa kehilangan data episode yang sudah ada. Di mode Tim, atur peran per episode di halaman **Roles** episode tersebut (`/episodes/[id]/roles`).

## 3. Alur Kerja Satu Episode (7 Tahap)

Episode berjalan linear lewat 7 tahap. Setiap episode punya halaman detail (`/episodes/[id]`) yang jadi hub — dari situ kamu masuk ke setiap tahap.

### Tahap 1 — Bank Tema
- Di `/bank-tema`, tambah ide topik baru: judul, deskripsi singkat, tag.
- Filter ide berdasarkan tag kalau daftarnya sudah panjang.
- **Tombol "Minta ide AI"** (opsional): masukkan kata kunci/kategori, dapat beberapa saran ide untuk ditambahkan manual.
- Kalau satu ide siap digarap, klik **"Jadikan Episode"** — ide berpindah ke tahap Riset & Outline sebagai episode baru.

### Tahap 2 — Riset & Outline
- Di halaman **Outline** episode, susun poin bicara berurutan (bisa diubah urutannya), tambahkan link referensi (mis. link Google Docs riset panjang).
- Di halaman **Guest Questions**, susun daftar pertanyaan untuk narasumber — terpisah dari poin bicara host.
- **Tombol "Draft dengan AI"** (opsional): dapat draft awal poin bicara/pertanyaan dari judul tema, muncul di area terpisah untuk kamu edit sebelum dipindah ke outline asli.

### Tahap 3 — Pra-Produksi
- **Checklist** alat & persiapan teknis (mic, rekaman cadangan, dst) — centang satu per satu.
- Catat **jadwal rekaman** (tanggal & jam) di halaman detail episode.
- Catat **kontak & briefing tamu** di halaman **Guests**.

### Tahap 4 — Panduan Eksekusi (fitur inti, hari-H rekaman)
- Buka halaman **Rundown** dulu untuk menyusun segmen (judul, talking points, estimasi durasi, urutan).
- Saat rekaman, buka **mode Eksekusi** (`/episodes/[id]/execute`) — tampilan full-screen tanpa navigasi, teks besar, kontras tinggi, dirancang dibaca sekilas dari laptop/tablet di meja studio.
- Timer jalan otomatis per segmen. Pindah segmen pakai tombol **Segmen Sebelumnya/Berikutnya** — manual, bukan otomatis saat waktu habis, supaya kontrol tetap di tangan host.
- Ada kolom **catatan singkat** per segmen (mis. "perlu take ulang") yang bisa diisi tanpa keluar dari mode full-screen.

### Tahap 5 — Pasca-Produksi
- **Checklist** editing (noise removal, mixing, final export).
- Catat **timestamp/chapter marker** untuk episode yang sudah direkam.
- Tulis **draft show notes** berbasis outline, atau tempel link ke dokumen show notes final di luar app (Google Docs).
- **Tombol "Draft show notes dengan AI"** (opsional): hasilkan draft dari outline yang sudah ada, review/edit sebelum simpan.

### Tahap 6 — Publish & Distribusi
- Isi metadata publish: judul final, deskripsi, tag.
- Centang **checklist platform** tujuan (Spotify, YouTube, RSS, dst) begitu sudah dipublish di sana.

### Tahap 7 — Evaluasi (opsional)
- Tulis catatan bebas: apa yang berjalan baik/kurang di episode ini.
- Kalau ada ide follow-up, tandai untuk otomatis muncul sebagai ide baru di Bank Tema.

Pindahkan status tahap episode lewat tombol ubah tahap di halaman detail episode — ini yang bikin episode "berjalan" dari satu tahap ke tahap berikutnya.

## 4. Board (khusus Mode Tim)

Di `/board`, lihat semua episode dikelompokkan per tahap (ala Kanban) — cara cepat tahu episode mana yang macet dan di tahap apa.

## 5. Soal Bantuan AI

Tiga tombol AI di atas (Bank Tema, Outline, Pasca-Produksi) **selalu manual** — tidak ada yang jalan otomatis di background. Kalau tombol AI gagal (API key belum diisi admin, kuota habis, dsb), akan muncul pesan error yang jelas dan kamu tetap bisa isi field itu manual — fitur AI tidak pernah memblokir alur kerja normal.

## 6. Yang Bukan Tugas Aplikasi Ini

Aplikasi ini **tidak** menggantikan tools yang sudah bagus di tugasnya — hanya menyimpan link ke sana:
- Naskah panjang tetap di Google Docs
- Desain cover tetap di Canva
- Editing audio/video tetap di software editing biasa
- Publish ke Spotify/YouTube tetap manual (dicentang di checklist, bukan otomatis)

## 7. Butuh Bantuan?

Ada masalah teknis (aplikasi tidak bisa diakses, error saat menyimpan) → hubungi admin. Untuk hal teknis deploy/server, lihat `README.md`.
