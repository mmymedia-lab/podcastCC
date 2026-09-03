# PRD — Aplikasi Persiapan & Eksekusi Podcast

## Problem Statement

Podcaster (solo maupun tim kecil) saat ini mengelola persiapan episode secara tercecer di banyak tempat — catatan ide di satu tempat, riset & outline di Google Docs, checklist alat & jadwal di chat/kertas, dan saat hari rekaman, rundown/talking points dibaca dari dokumen yang tidak dirancang untuk dilihat sambil bicara di depan mikrofon. Tidak ada satu tampilan yang dirancang khusus untuk dipakai *selama* rekaman berlangsung: minim distraksi, mudah dibaca sekilas, dengan timer berjalan.

Akibatnya:
- Alur bicara bisa keluar dari rencana karena talking points tidak mudah diakses real-time saat rekaman
- Tidak ada jejak konsisten dari ide tema sampai episode selesai dipublikasikan
- Kalau berkembang jadi tim (producer/host/editor terpisah), tidak ada cara melihat status tiap episode sedang di tahap apa

## Solution

Aplikasi web internal, self-hosted, yang mengikuti satu alur linear per episode podcast dari ide sampai evaluasi:

1. **Bank Tema** — kumpulan ide topik dengan kategori/tag
2. **Riset & Outline** — poin bicara, referensi (link eksternal), daftar pertanyaan narasumber
3. **Pra-Produksi** — checklist alat, jadwal rekaman, kontak & briefing tamu
4. **Panduan Eksekusi** (fitur inti) — tampilan full-screen minim distraksi berisi rundown/run-of-show, talking points per segmen, dan timer berjalan, dibuka dari laptop/tablet di studio saat hari-H
5. **Pasca-Produksi** — checklist editing, timestamp/chapter, draft show notes
6. **Publish & Distribusi** — checklist metadata (judul, deskripsi, tag) & platform tujuan
7. **Evaluasi** (opsional) — catatan feedback & ide follow-up untuk episode berikutnya

Aplikasi mendukung dua mode skala pengguna yang dipilih via pengaturan:
- **Mode Solo** — satu akun memegang semua peran, tanpa board status
- **Mode Tim** — peran producer/host/editor per episode, dengan status board (Kanban) yang menunjukkan setiap episode sedang di tahap mana

Aplikasi **tidak** menggantikan tools yang sudah baik di tugasnya (Google Docs untuk naskah panjang, Canva untuk desain cover, software editing audio/video) — hanya menyimpan link ke aset-aset itu.

Di tiga titik yang paling sering butuh "mancing ide", aplikasi menyediakan bantuan AI (Gemini API) sebagai tombol opsional yang dipicu manual oleh pengguna — bukan proses otomatis/background:
- **Bank Tema** — generate beberapa ide topik turunan dari satu kata kunci/kategori
- **Riset & Outline** — draft awal poin bicara atau daftar pertanyaan narasumber dari judul tema
- **Pasca-Produksi** — draft show notes dari outline yang sudah ada

Hasil AI selalu berupa draft yang harus ditinjau/diedit manual sebelum disimpan sebagai data final — tidak pernah langsung menimpa data tanpa konfirmasi pengguna.

## User Stories

### Autentikasi & Pengaturan Mode
1. Sebagai pengguna baru, saya bisa login dengan email & password (NextAuth) sehingga data episode saya privat.
2. Sebagai pengguna, saya bisa memilih mode **Solo** atau **Tim** di pengaturan awal, dan mode ini bisa diubah kapan saja tanpa kehilangan data episode yang sudah ada.
3. Sebagai admin/pemilik workspace mode Tim, saya bisa mengundang anggota lain dan memberi peran (Producer, Host, Editor) per episode.

### 1. Bank Tema
1. Sebagai pengguna, saya bisa menambah ide topik baru dengan judul, deskripsi singkat, dan tag/kategori.
2. Sebagai pengguna, saya bisa memfilter/mencari ide topik berdasarkan tag.
3. Sebagai pengguna, saya bisa mengubah status ide topik (mis. "ide mentah" → "dipilih untuk episode") dan mengaitkannya ke satu episode.

### 2. Riset & Outline
1. Sebagai pengguna, saya bisa membuat outline untuk satu episode berisi daftar poin bicara terstruktur (urutan bisa diubah/drag).
2. Sebagai pengguna, saya bisa menambahkan link referensi eksternal (mis. link Google Docs berisi riset panjang) ke outline.
3. Sebagai pengguna, saya bisa menyusun daftar pertanyaan untuk narasumber, terpisah dari poin bicara host.

### 3. Pra-Produksi
1. Sebagai pengguna, saya bisa membuat checklist alat/persiapan teknis per episode (mis. mic, rekaman cadangan) dan mencentangnya satu per satu.
2. Sebagai pengguna, saya bisa mencatat jadwal rekaman (tanggal & jam) untuk satu episode.
3. Sebagai pengguna, saya bisa mencatat kontak & catatan briefing untuk tamu/narasumber yang diundang.

### 4. Panduan Eksekusi (fitur inti)
1. Sebagai host, saya bisa membuka satu episode dalam **mode eksekusi full-screen** yang menyembunyikan navigasi aplikasi dan hanya menampilkan rundown.
2. Sebagai host, saya melihat rundown sebagai daftar segmen berurutan, masing-masing dengan talking points dan estimasi durasi.
3. Sebagai host, saya bisa menjalankan timer yang berjalan otomatis dan menampilkan sisa/lewat waktu per segmen, serta bisa berpindah ke segmen berikutnya secara manual (bukan otomatis berdasarkan timer habis).
4. Sebagai host, teks pada mode eksekusi cukup besar untuk dibaca sekilas dari jarak wajar (laptop/tablet di meja studio), dengan kontras tinggi.
5. Sebagai host, saya bisa menandai catatan singkat di tengah sesi (mis. "perlu take ulang di segmen 3") tanpa keluar dari mode full-screen.

### 5. Pasca-Produksi
1. Sebagai editor, saya bisa mencatat timestamp/chapter marker untuk episode yang sudah direkam.
2. Sebagai editor, saya bisa mencentang checklist tahap editing (mis. noise removal, mixing, final export).
3. Sebagai pengguna, saya bisa menulis draft show notes berbasis outline yang sudah ada (bisa disalin dari poin bicara), lalu menambahkan link ke dokumen show notes final di luar app kalau ditulis lebih lengkap di Google Docs.

### 6. Publish & Distribusi
1. Sebagai pengguna, saya bisa mengisi metadata publish (judul final, deskripsi, tag) untuk satu episode.
2. Sebagai pengguna, saya bisa mencentang checklist platform tujuan (mis. Spotify, YouTube, RSS) yang sudah dipublish untuk episode tersebut.

### 7. Evaluasi (opsional)
1. Sebagai pengguna, saya bisa menulis catatan evaluasi bebas untuk satu episode setelah publish (apa yang berjalan baik/kurang).
2. Sebagai pengguna, saya bisa mencatat ide follow-up yang otomatis bisa diangkat jadi ide baru di Bank Tema.

### Bantuan AI (Gemini API)
1. Sebagai pengguna, di halaman Bank Tema saya bisa menekan tombol "Minta ide AI", memasukkan kata kunci/kategori, dan menerima beberapa saran ide topik yang bisa saya tambahkan satu per satu ke Bank Tema (bukan otomatis tersimpan semua).
2. Sebagai pengguna, di halaman Outline saya bisa menekan tombol "Draft dengan AI" untuk mendapat draft poin bicara atau draft daftar pertanyaan narasumber berdasarkan judul tema episode, yang muncul di area terpisah untuk saya edit/pindahkan manual ke outline asli.
3. Sebagai pengguna, di halaman Pasca-Produksi saya bisa menekan tombol "Draft show notes dengan AI" yang menghasilkan draft show notes dari outline episode yang sudah ada, untuk saya edit sebelum disimpan sebagai draft final.
4. Sebagai pengguna, saat pemanggilan AI gagal (mis. API key belum diisi, kuota habis, timeout), saya melihat pesan error yang jelas dan tetap bisa mengisi field terkait secara manual — fitur AI tidak boleh memblokir alur kerja normal.

### Status & Board (khusus Mode Tim)
1. Sebagai producer, saya melihat board Kanban seluruh episode dikelompokkan berdasarkan tahap (Bank Tema → ... → Evaluasi), untuk tahu episode mana yang macet.
2. Sebagai anggota tim, saya hanya melihat/mengubah tahap yang relevan dengan peran saya (mis. editor tidak perlu mengedit outline), tapi tetap bisa melihat semua data episode secara read-only.

## Implementation Decisions

**Model data inti (konsep, bukan skema final):**
- `Episode` — entitas pusat, punya status tahap (enum 7 tahap), relasi ke semua entitas turunan
- `ThemeIdea` — item Bank Tema, punya tag, opsional relasi ke satu `Episode`
- `OutlineItem` — poin bicara berurutan milik satu `Episode`
- `GuestQuestion` — pertanyaan narasumber, terpisah dari `OutlineItem`
- `ChecklistItem` — generik, dipakai ulang untuk checklist Pra-Produksi, Pasca-Produksi, dan Publish (dibedakan lewat field `category`)
- `RundownSegment` — segmen rundown untuk mode eksekusi, punya urutan, talking points, estimasi durasi
- `Guest` — kontak & briefing tamu, relasi ke `Episode`
- `EvaluationNote` — catatan evaluasi bebas
- `User` — dengan `role` (Producer/Host/Editor) yang berlaku per `Episode` di mode Tim; di mode Solo, role tidak relevan/disembunyikan dari UI
- `WorkspaceSettings` — menyimpan pilihan mode Solo/Tim

**Mode Eksekusi (fitur inti):**
- Halaman terpisah, layout tanpa sidebar/navigasi standar, dioptimalkan untuk viewport laptop & tablet
- Timer berjalan di client-side (tidak perlu sinkronisasi server real-time/websocket — cukup timer lokal per sesi browser, karena satu sesi eksekusi dipakai satu perangkat di studio)
- Perpindahan segmen manual (tombol next/prev), bukan otomatis berdasarkan timer habis, karena kontrol tetap ada di tangan host

**Auth:** NextAuth dengan credentials provider (email+password), session disimpan di database yang sama (Postgres)

**Bantuan AI (Gemini API):**
- Dipanggil lewat satu API route server-side (mis. `/api/ai/*`) yang menyimpan `GEMINI_API_KEY` di `.env` — tidak pernah dipanggil langsung dari client, dan key tidak pernah dikirim ke browser
- Tiga endpoint tipis dengan prompt berbeda: generate ide tema, draft outline/pertanyaan narasumber, draft show notes — masing-masing menerima input singkat (kata kunci/judul/outline existing) dan mengembalikan teks draft
- UI menampilkan hasil AI di area terpisah/preview, pengguna yang memilih menyalin/menyimpan ke field asli — tidak ada auto-save hasil AI
- Dipicu manual (klik tombol), tidak ada pemanggilan otomatis/terjadwal, untuk menghindari biaya API yang tidak terkontrol
- `.env.example` disediakan sebagai template kosong; `.env` asli ditambahkan ke `.gitignore`

**MoSCoW (prioritas implementasi dalam satu rilis, bukan pembagian versi):**
- **Must:** Auth, toggle Solo/Tim, Bank Tema, Riset & Outline, Panduan Eksekusi (timer + rundown + full-screen), Pra-Produksi (checklist + jadwal)
- **Should:** Pasca-Produksi (checklist + timestamp), Publish & Distribusi, Board Kanban mode Tim
- **Could:** Evaluasi, briefing/kontak tamu terstruktur (bisa jadi textarea bebas dulu), bantuan AI (Gemini) di Bank Tema/Outline/Pasca-Produksi
- **Won't (rilis ini):** integrasi API pihak ketiga lain (Google Docs, Canva, platform publish), notifikasi/reminder otomatis, bantuan AI otomatis/background (selalu manual-trigger)

**NFR:**
- Aplikasi harus tetap responsif dipakai di tablet (mode eksekusi jadi prioritas UX tertinggi)
- Self-hosted: harus berjalan sebagai container Docker Compose di server `yassalam` (Ubuntu 24.04, containerd), tidak bergantung layanan cloud pihak ketiga
- Akses privat via Tailscale sebagai default; struktur harus memungkinkan expose subdomain publik via Caddy di kemudian hari tanpa perubahan arsitektur besar
- Database Postgres terpisah dari database n8n yang sudah berjalan di server yang sama (tidak berbagi skema/instance logis)
- Timer di mode eksekusi tidak boleh nge-lag atau melompat saat tab browser idle di background (perlu dites khusus, timer berbasis timestamp bukan hanya `setInterval` counter naif)
- Kredensial API Gemini disimpan di `.env` lokal server, tidak pernah di-hardcode di kode atau ter-commit ke repo

## Testing Decisions

- Fokus pengujian pada **perilaku eksternal per fitur** (bukan detail implementasi Prisma/NextAuth):
  - Alur CRUD tiap entitas (Bank Tema, Outline, Checklist, Rundown Segment) via API route — test lewat request/response, bukan lewat query database langsung
  - Mode Eksekusi: test logika timer secara terisolasi (fungsi murni berbasis timestamp), karena ini bagian paling berisiko regresi
  - Toggle Solo/Tim: test bahwa perubahan mode tidak menghapus/merusak data episode yang sudah ada
  - Role-based visibility mode Tim: test bahwa peran tertentu tidak bisa mengubah data di luar tahap yang relevan
- Tidak perlu end-to-end browser test penuh untuk MVP; cukup unit/integration test di level API route + component test untuk komponen Mode Eksekusi (timer, rundown navigation)
- Endpoint bantuan AI: test dengan Gemini API di-mock (tidak memanggil API sungguhan di test suite) — verifikasi request yang dikirim ke API route terbentuk benar, response sukses diteruskan ke UI, dan response gagal ditangani sesuai user story 30 (pesan error jelas, tidak memblokir alur manual)

## Out of Scope

- Integrasi API dengan Google Docs, Canva, atau software editing audio/video — hanya field link manual
- Chatbot/asisten AI percakapan bebas — bantuan AI dibatasi ke tiga endpoint tipis dan spesifik tugas (ide tema, draft outline/pertanyaan, draft show notes)
- Penyimpanan riwayat percakapan AI atau personalisasi model dari data historis pengguna
- Aplikasi mobile native (Flutter/React Native) — web app responsif dianggap cukup untuk laptop/tablet di studio
- Multi-tenant/multi-organisasi (mis. menjual ke pesantren/organisasi lain sebagai SaaS) — ini aplikasi internal untuk satu workspace
- Analytics/growth tooling (GA4, metrik pertumbuhan) — tidak relevan untuk aplikasi internal
- Notifikasi otomatis (email/WhatsApp reminder jadwal rekaman)
- Publish otomatis ke platform (Spotify/YouTube API) — checklist manual cukup untuk MVP

## Further Notes

- **TODO sebelum project dianggap "finishing"**: poles tampilan pakai Tailwind atau design system. Saat ini seluruh app (~25 halaman) murni HTML default tanpa `className` sama sekali — cuma 4 baris di `app/globals.css` (margin reset + font). Ini keputusan sadar untuk memprioritaskan fungsionalitas dulu (PRD MoSCoW di atas tidak menyebut visual design), tapi jangan sampai terlewat saat masuk tahap finishing. Pertimbangkan skill `frontend-design` (styling langsung, cepat) atau `ui-ux-pro-max` (kalau mau design system/token yang konsisten lintas ~25 halaman sekaligus).
- Kandidat fitur v2 (belum disepakati, tidak dikerjakan sekarang): reminder jadwal rekaman, integrasi API publish otomatis, memperluas bantuan AI ke titik lain (mis. saran judul/deskripsi publish) kalau tiga titik awal terbukti berguna
- Precedent internal yang relevan: pola "internal tool tervalidasi lalu digeneralisasi" pernah dicatat di riset workflow vibe coding sebelumnya (lihat `vibe-coding-workflow-dan-peluang-produk.md`, bagian 6.6) — bisa jadi arah lanjutan kalau suatu saat aplikasi ini ingin ditawarkan ke organisasi lain, tapi itu keputusan terpisah yang belum diambil.
