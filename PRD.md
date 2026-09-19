# PRD — Yassalam Media Studio

> Sebelumnya bernama "Aplikasi Persiapan & Eksekusi Podcast". Direbrand karena workspace ini sekarang menaungi dua lini kerja produksi konten (podcast dan video), bukan cuma podcast.

## Problem Statement

Tim produksi konten (podcast maupun video) saat ini mengelola persiapan secara tercecer di banyak tempat — catatan ide di satu tempat, riset/naskah di Google Docs, checklist alat & jadwal di chat/kertas, dan saat hari eksekusi (rekaman podcast atau syuting video), rundown/shot list/talking points dibaca dari dokumen yang tidak dirancang untuk dipakai sambil bekerja. Untuk podcast khususnya, tidak ada satu tampilan yang dirancang khusus untuk dipakai *selama* rekaman berlangsung: minim distraksi, mudah dibaca sekilas, dengan timer berjalan.

Akibatnya:
- Alur bicara/syuting bisa keluar dari rencana karena talking points/shot list tidak mudah diakses real-time
- Tidak ada jejak konsisten dari ide sampai konten selesai dipublikasikan/didistribusikan
- Kalau berkembang jadi tim dengan peran terpisah (produksi/host/editor/tim syuting), tidak ada cara melihat status tiap episode/proyek sedang di tahap apa

## Solution

Aplikasi web internal, self-hosted, dengan **dua lini kerja** yang berbagi satu workspace, satu sistem auth, dan satu mekanisme Solo/Tim + bantuan AI:

### Lini 1 — Podcast Prep & Execution
Alur linear per episode podcast dari ide sampai evaluasi:
1. **Bank Tema** — kumpulan ide topik dengan kategori/tag
2. **Riset & Outline** — poin bicara, referensi (link eksternal), daftar pertanyaan narasumber
3. **Pra-Produksi** — checklist alat, jadwal rekaman, kontak & briefing tamu, penugasan host dari roster Host
4. **Panduan Eksekusi** (fitur inti) — tampilan full-screen minim distraksi berisi rundown/run-of-show, talking points per segmen, dan timer per segmen yang dimulai manual oleh host; opsional dipasangkan (pairing kode 6 digit) ke tampilan TV/tablet/HP companion yang menampilkan info sama secara read-only
5. **Pasca-Produksi** — checklist editing, timestamp/chapter, draft show notes
6. **Publish & Distribusi** — checklist metadata (judul, deskripsi, tag) & platform tujuan
7. **Evaluasi** (opsional) — catatan evaluasi episode + evaluasi performa host, dan ide follow-up untuk episode berikutnya

### Lini 2 — Video Production
Alur linear per proyek video dari ide sampai distribusi:
1. **Ide** — tahap awal, proyek baru dibuat dengan judul
2. **Pra-Produksi** — Script Breakdown per adegan (lokasi, properti, cast), Storyboard (link ke frame yang sudah digambar/disimpan di Drive), Shot List (deskripsi, angle, lensa, estimasi durasi)
3. **Produksi** — Hari Syuting & Call Sheet (jadwal, call time, lokasi, jadwal adegan, estimasi wrap) untuk syuting multi-hari, dengan Continuity Log per hari syuting (slate, take, catatan kontinuitas, append-only)
4. **Pasca-Produksi** — Edit Version bertahap (Rough Cut → Fine Cut → Picture Lock), masing-masing versi punya status approval (Draft/In Review/Approved) dan bisa menerima Revision Notes yang bisa ditandai selesai
5. **Distribusi & Evaluasi** — Deliverables (aset final: video, thumbnail, caption, dst., dengan link Drive opsional), Evaluasi Pasca-Tayang, dan Peran Tim per proyek

Kedua lini mendukung dua mode skala pengguna yang dipilih via satu pengaturan workspace bersama:
- **Mode Solo** — satu akun memegang semua peran, tanpa board status
- **Mode Tim** — peran berbeda per episode (podcast) dan per proyek (video), dengan status board (Kanban) yang menunjukkan setiap episode/proyek sedang di tahap mana

Aplikasi **tidak** menggantikan tools yang sudah baik di tugasnya (Google Docs untuk naskah panjang, Canva untuk desain cover, software editing audio/video, Google Drive untuk penyimpanan aset visual) — hanya menyimpan link ke aset-aset itu.

Di titik-titik yang paling sering butuh "mancing ide", aplikasi menyediakan bantuan AI (Gemini API) sebagai tombol opsional yang dipicu manual oleh pengguna — bukan proses otomatis/background:
- **Bank Tema** (podcast) — generate beberapa ide topik turunan dari satu kata kunci/kategori
- **Riset & Outline** (podcast) — draft awal poin bicara atau daftar pertanyaan narasumber dari judul tema
- **Pasca-Produksi** (podcast) — draft show notes dari outline yang sudah ada
- **Pra-Produksi** (video) — draft Script Breakdown dan draft Shot List dari judul proyek

Hasil AI selalu berupa draft yang harus ditinjau/diedit manual sebelum disimpan sebagai data final — tidak pernah langsung menimpa data tanpa konfirmasi pengguna. Setiap pengguna bisa mengisi API key Gemini miliknya sendiri (dienkripsi di database) sebagai pengganti key workspace bersama, dan pemanggilan AI dibatasi rate limit per pengguna untuk mencegah biaya tak terkontrol.

## User Stories

### Autentikasi & Pengaturan Mode
1. Sebagai pengguna baru, saya bisa login dengan email & password (NextAuth) sehingga data saya privat.
2. Sebagai pengguna, saya bisa memilih mode **Solo** atau **Tim** di pengaturan workspace, dan mode ini bisa diubah kapan saja tanpa kehilangan data episode/proyek yang sudah ada. Pengaturan ini berlaku untuk kedua lini (podcast & video) sekaligus, bukan per lini.
3. Sebagai admin/pemilik workspace mode Tim, saya bisa mengundang anggota lain dan memberi peran per episode (podcast) dan/atau per proyek (video) secara terpisah — satu pengguna bisa punya peran berbeda di lini yang berbeda.
4. Sebagai pengguna, saya bisa mengisi API key Gemini pribadi di Pengaturan Workspace supaya pemanggilan AI saya tidak memakai kuota key bersama.

### Lini 1 — Podcast Prep & Execution

#### 1. Bank Tema
1. Sebagai pengguna, saya bisa menambah ide topik baru dengan judul, deskripsi singkat, dan tag/kategori.
2. Sebagai pengguna, saya bisa memfilter/mencari ide topik berdasarkan tag.
3. Sebagai pengguna, saya bisa mengubah status ide topik (mis. "ide mentah" → "dipilih untuk episode") dan mengaitkannya ke satu episode.

#### 2. Riset & Outline
1. Sebagai pengguna, saya bisa membuat outline untuk satu episode berisi daftar poin bicara terstruktur (urutan bisa diubah).
2. Sebagai pengguna, saya bisa menambahkan link referensi eksternal ke outline.
3. Sebagai pengguna, saya bisa menyusun daftar pertanyaan untuk narasumber, terpisah dari poin bicara host.

#### 3. Pra-Produksi
1. Sebagai pengguna, saya bisa membuat checklist alat/persiapan teknis per episode dan mencentangnya satu per satu.
2. Sebagai pengguna, saya bisa mencatat jadwal rekaman (tanggal & jam) untuk satu episode.
3. Sebagai pengguna, saya bisa mencatat kontak & catatan briefing untuk tamu/narasumber yang diundang.
4. Sebagai pengguna, saya bisa memilih host dari roster Host untuk ditugaskan ke satu episode.

#### 4. Panduan Eksekusi (fitur inti)
1. Sebagai host, saya bisa membuka satu episode dalam **mode eksekusi full-screen** (tab terpisah) yang menyembunyikan navigasi aplikasi dan hanya menampilkan rundown.
2. Sebagai host, saya melihat rundown sebagai daftar segmen berurutan, masing-masing dengan talking points dan estimasi durasi, plus panel bantu yang bisa dibuka/tutup: Ringkasan Rundown, Info Tamu, Pertanyaan Narasumber.
3. Sebagai host, timer untuk segmen aktif **tidak berjalan otomatis** — saya harus menekan tombol "Mulai Segmen Ini" untuk memulainya, dan timer berhenti/reset setiap kali saya pindah ke segmen lain (harus ditekan Play lagi per segmen). Perpindahan segmen sendiri tetap manual (tombol next/prev), bukan otomatis berdasarkan timer habis.
4. Sebagai host, teks pada mode eksekusi cukup besar untuk dibaca sekilas dari jarak wajar (laptop/tablet di meja studio), dengan kontras tinggi, dan bisa dijadikan fullscreen browser.
5. Sebagai host, saya bisa menandai catatan singkat di tengah sesi tanpa keluar dari mode full-screen.
6. Sebagai host, saya bisa memasangkan (pairing) satu perangkat lain (TV/tablet/HP, termasuk app companion Flutter) ke sesi Mode Eksekusi lewat kode 6 digit, supaya perangkat itu ikut menampilkan segmen aktif, talking points, dan status timer (jalan/belum) secara read-only — perangkat companion tidak butuh login, hanya kode pairing yang berlaku sampai waktu tertentu.

#### 5. Pasca-Produksi
1. Sebagai editor, saya bisa mencatat timestamp/chapter marker untuk episode yang sudah direkam.
2. Sebagai editor, saya bisa mencentang checklist tahap editing (mis. noise removal, mixing, final export).
3. Sebagai pengguna, saya bisa menulis draft show notes berbasis outline yang sudah ada, lalu menambahkan link ke dokumen show notes final di luar app.

#### 6. Publish & Distribusi
1. Sebagai pengguna, saya bisa mengisi metadata publish (judul final, deskripsi, tag) untuk satu episode.
2. Sebagai pengguna, saya bisa mencentang checklist platform tujuan yang sudah dipublish untuk episode tersebut.

#### 7. Evaluasi (opsional)
1. Sebagai pengguna, saya bisa menulis catatan evaluasi bebas untuk satu episode setelah publish.
2. Sebagai pengguna, saya bisa mencatat ide follow-up yang bisa diangkat jadi ide baru di Bank Tema.
3. Sebagai pengguna, saya bisa menulis evaluasi performa host yang bertugas di episode tersebut, terpisah dari evaluasi episode/topik itu sendiri.

### Lini 2 — Video Production

#### 1. Ide
1. Sebagai pengguna, saya bisa membuat proyek video baru dengan judul, dimulai di tahap Ide.

#### 2. Pra-Produksi
1. Sebagai pengguna, saya bisa menyusun Script Breakdown per adegan: lokasi, properti, cast, catatan, dengan urutan yang bisa diubah.
2. Sebagai pengguna, saya bisa menambahkan frame Storyboard berupa link ke gambar yang sudah diunggah ke Google Drive, beserta catatan.
3. Sebagai pengguna, saya bisa menyusun Shot List: deskripsi shot, angle, lensa, estimasi durasi per shot.
4. Sebagai pengguna, saya bisa meminta draft Script Breakdown atau draft Shot List dari AI berdasarkan judul proyek, sebagai titik awal yang saya edit lebih lanjut.

#### 3. Produksi
1. Sebagai pengguna, saya bisa membuat satu atau beberapa Hari Syuting untuk proyek yang sama (mendukung syuting multi-hari), masing-masing dengan tanggal, call time, lokasi, jadwal adegan, dan estimasi wrap — berfungsi sebagai call sheet hari itu.
2. Sebagai pengguna di lapangan, saya bisa mencatat Continuity Log per take selama syuting berlangsung (slate, nomor take, apakah take-nya bagus, catatan kontinuitas) — log ini hanya bisa ditambah/dihapus, tidak diedit, supaya riwayatnya tetap sebagai catatan langsung dari lapangan.

#### 4. Pasca-Produksi
1. Sebagai editor, saya bisa mengunggah versi edit baru (link Drive) pada salah satu tahap: Rough Cut, Fine Cut, atau Picture Lock — setiap tahap adalah file/versi baru, bukan file yang sama diubah statusnya.
2. Sebagai reviewer, saya bisa memberi status approval (Draft/In Review/Approved) pada satu versi edit, dan menuliskan Revision Notes pada versi tersebut.
3. Sebagai editor, saya bisa menandai satu Revision Note sebagai selesai ditindaklanjuti tanpa menghapus riwayat catatan yang pernah diberikan.

#### 5. Distribusi & Evaluasi
1. Sebagai pengguna, saya bisa mendaftarkan Deliverables (video final, thumbnail, caption, dst.), mencentangnya saat selesai, dan opsional melampirkan link Drive ke asetnya.
2. Sebagai pengguna, saya bisa menulis catatan Evaluasi Pasca-Tayang untuk proyek yang sudah didistribusikan.
3. Sebagai admin/pemilik workspace mode Tim, saya bisa memberi Peran Tim per proyek (Leader Produksi Video, Tim Pra-Produksi, Tim Produksi, Tim Pasca-Produksi) — satu pengguna bisa memegang lebih dari satu peran pada proyek yang sama.

### Bantuan AI (Gemini API)
1. Sebagai pengguna, di halaman Bank Tema saya bisa menekan tombol "Minta ide AI" dan menerima beberapa saran ide topik untuk ditambahkan satu per satu ke Bank Tema.
2. Sebagai pengguna, di halaman Outline saya bisa menekan tombol "Draft dengan AI" untuk mendapat draft poin bicara/pertanyaan narasumber, muncul di area terpisah untuk saya salin manual.
3. Sebagai pengguna, di halaman Pasca-Produksi podcast saya bisa menekan tombol draft show notes AI berdasarkan outline yang sudah ada.
4. Sebagai pengguna, di halaman Script Breakdown dan Shot List video saya bisa menekan tombol draft AI berdasarkan judul proyek, dengan gating izin yang sama seperti field manual di tahap Pra-Produksi.
5. Sebagai pengguna, saat pemanggilan AI gagal (API key belum diisi, kuota habis, timeout, atau rate limit tercapai) saya melihat pesan error yang jelas dan tetap bisa mengisi field terkait secara manual — fitur AI tidak boleh memblokir alur kerja normal.

### Status & Board (khusus Mode Tim)
1. Sebagai lead produksi, saya melihat board Kanban seluruh episode podcast (dan terpisah, seluruh proyek video) dikelompokkan berdasarkan tahap, untuk tahu mana yang macet.
2. Sebagai anggota tim, saya hanya bisa mengubah tahap yang relevan dengan peran saya, tapi tetap bisa melihat semua data secara read-only.

## Implementation Decisions

**Model data podcast (konsep, bukan skema final):**
- `Episode` — entitas pusat, status tahap `EpisodeStage` (7 tahap), relasi ke semua entitas turunan
- `ThemeIdea`, `OutlineItem`, `GuestQuestion`, `ChecklistItem` (generik lewat field `category`), `RundownSegment`, `Guest`, `EvaluationNote`, `TimestampMarker`
- `Host` — roster host/moderator, relasi many-to-one ke `Episode`; `HostEvaluation` — evaluasi performa host per episode, terpisah dari `EvaluationNote`
- `EpisodeRole` dengan `EpisodeRoleType` (`LEADER_PRODUKSI`, `TIM_BRAINSTORMING`, `TIM_LIVE`, `TIM_EVALUASI`) — direstrukturisasi dari rancangan awal {Producer, Host, Editor} supaya mencerminkan hierarki produksi sesungguhnya: satu lead plus satu peran per fase kerja
- `TvPairing` — kode pairing 6 digit + masa berlaku untuk companion display Mode Eksekusi
- `User`, `WorkspaceSettings` (mode Solo/Tim, dipakai bersama lini video)

**Model data video (konsep, bukan skema final):**
- `Project` — entitas pusat lini video, status `ProjectStage` (Ide/Pra-Produksi/Produksi/Pasca-Produksi/Distribusi), sepenuhnya terpisah dari `Episode` (hanya berbagi `User`/`WorkspaceSettings`)
- `ScriptBreakdown`, `StoryboardFrame`, `ShotListItem` — tiga koleksi berurutan terpisah di tahap Pra-Produksi (masing-masing biasanya dikerjakan orang berbeda)
- `ShootingDay` (menyimpan info call sheet langsung, tanpa model `CallSheet` terpisah) dan `ContinuityNote` (append-only, 1 hari syuting bisa banyak catatan)
- `EditVersion` dengan `EditVersionStage` (Rough Cut/Fine Cut/Picture Lock) dan `EditApprovalStatus` (Draft/In Review/Approved); `RevisionNote` per versi edit dengan flag `resolved`
- `Deliverable` (link Drive opsional, beda dari `ChecklistItem` yang generik), `ProjectEvaluationNote`
- `ProjectRole` dengan `ProjectRoleType` (`LEADER_PRODUKSI_VIDEO`, `TIM_PRA_PRODUKSI`, `TIM_PRODUKSI`, `TIM_PASCA_PRODUKSI`) — mirip bentuk `EpisodeRoleType` tapi enum & tabel terpisah karena kosakata perannya beda

**Mode Eksekusi (fitur inti podcast):**
- Halaman terpisah (tab baru), layout tanpa sidebar/navigasi standar, dioptimalkan untuk viewport laptop & tablet
- Timer client-side berbasis timestamp (`Date.now()` dibandingkan tiap tick), bukan counter naif — supaya tidak nge-lag/lompat saat tab browser idle di background
- Timer **tidak mulai otomatis**: butuh aksi eksplisit "Mulai Segmen Ini" dari host, dan reset setiap ganti segmen — mencegah waktu berjalan diam-diam sebelum host benar-benar siap
- Companion display (`TvPairing` + endpoint publik `/api/tv/session/[code]`) polling status aktif dari server secara berkala; endpoint ini sengaja tanpa autentikasi (kontrol akses lewat kode pairing + masa berlaku), karena dipakai perangkat tanpa sesi login (Smart TV, tablet, app Flutter companion)
- Perpindahan segmen manual (tombol next/prev), bukan otomatis berdasarkan timer habis, karena kontrol tetap ada di tangan host

**Auth:** NextAuth dengan credentials provider (email+password), strategi JWT, session/user disimpan di database yang sama (Postgres). Tidak ada provider OAuth, sehingga aplikasi tidak bergantung pada `NEXTAUTH_URL` untuk redirect callback absolut.

**Bantuan AI (Gemini API):**
- Dipanggil lewat API route server-side tipis per titik bantuan (mis. `/api/ai/*`) — key tidak pernah dikirim ke browser
- Key default disimpan di `.env` (`GEMINI_API_KEY`, model lewat `GEMINI_MODEL`); pengguna individu boleh override dengan key pribadi (dienkripsi di database, lihat `lib/user-gemini-key.ts`)
- Setiap endpoint AI dibatasi rate limit per pengguna (`lib/ai-rate-limit.ts`) untuk mencegah biaya API tak terkontrol dari pemanggilan berulang
- UI menampilkan hasil AI di area terpisah/preview; pengguna yang memilih menyalin/menyimpan ke field asli — tidak ada auto-save hasil AI
- Dipicu manual (klik tombol), tidak ada pemanggilan otomatis/terjadwal
- `.env.example` disediakan sebagai template kosong; `.env` asli ditambahkan ke `.gitignore`

**MoSCoW (prioritas implementasi, sudah tercapai — dicatat sebagai riwayat keputusan):**
- **Must:** Auth, toggle Solo/Tim, Bank Tema, Riset & Outline, Panduan Eksekusi (timer + rundown + full-screen), Pra-Produksi podcast (checklist + jadwal)
- **Should:** Pasca-Produksi podcast, Publish & Distribusi, Board Kanban mode Tim
- **Could:** Evaluasi podcast, briefing/kontak tamu terstruktur, bantuan AI (Gemini) di Bank Tema/Outline/Pasca-Produksi, companion display TV/tablet untuk Mode Eksekusi
- **Selanjutnya (video production, dianggap rilis lanjutan bukan MVP awal):** seluruh 5 tahap Video Production (Ide → Distribusi & Evaluasi), termasuk bantuan AI di Script Breakdown & Shot List
- **Won't (belum dikerjakan):** integrasi API pihak ketiga lain (Google Docs, Canva, platform publish), notifikasi/reminder otomatis, bantuan AI otomatis/background (selalu manual-trigger), aplikasi mobile native untuk mengelola konten (lihat catatan companion TV app di Out of Scope)

**NFR:**
- Aplikasi harus tetap responsif dipakai di tablet (Mode Eksekusi podcast jadi prioritas UX tertinggi)
- Self-hosted di server `yassalam` (Ubuntu 24.04), dijalankan sebagai **container Podman rootless dengan systemd Quadlet** (`~/.config/containers/systemd/podcastcc-*.container`) — bukan Docker Compose seperti rancangan awal; `docker-compose.yml` di repo hanya untuk environment lain yang tidak pakai Quadlet, dan sengaja diberi nama network/volume berbeda supaya tidak collision dengan resource Quadlet production (lihat README untuk insiden yang melatarbelakangi ini)
- Akses publik lewat **Cloudflare Tunnel** (`https://podcastcc.yassalam.id`, TLS asli terbitan Cloudflare) — bukan lagi Tailscale-only seperti rancangan awal; jalur Tailscale privat (Caddy self-signed) sudah dinonaktifkan untuk app ini per keputusan pemilik workspace, karena companion TV app butuh diakses dari device yang tidak selalu bisa join Tailscale
- Database Postgres terpisah dari database service lain (n8n, dll) yang berjalan di server yang sama
- Timer di Mode Eksekusi tidak boleh nge-lag/melompat saat tab browser idle di background — berbasis timestamp, dites terisolasi
- Kredensial API Gemini (default maupun per-user) tidak pernah di-hardcode di kode atau ter-commit ke repo

## Testing Decisions

- Fokus pengujian pada **perilaku eksternal per fitur** (bukan detail implementasi Prisma/NextAuth), berlaku untuk kedua lini (podcast & video):
  - Alur CRUD tiap entitas via API route/server action — test lewat request/response, bukan lewat query database langsung
  - Mode Eksekusi podcast: test logika timer secara terisolasi (fungsi murni berbasis timestamp, termasuk perilaku "tidak mulai otomatis"), karena ini bagian paling berisiko regresi
  - Toggle Solo/Tim: test bahwa perubahan mode tidak menghapus/merusak data episode/proyek yang sudah ada
  - Role-based visibility mode Tim: test bahwa peran tertentu (baik `EpisodeRoleType` maupun `ProjectRoleType`) tidak bisa mengubah data di luar tahap yang relevan (`canEditStage`/`canEditProjectStage`)
- Tidak perlu end-to-end browser test penuh untuk setiap fitur; cukup unit/integration test di level API route/action + component test untuk komponen Mode Eksekusi (timer, rundown navigation) — verifikasi end-to-end manual lewat browser dilakukan saat deploy ke server untuk fitur-fitur berisiko tinggi (Mode Eksekusi, migrasi data)
- Endpoint bantuan AI: test dengan Gemini API di-mock (tidak memanggil API sungguhan di test suite) — verifikasi request yang dikirim ke API route terbentuk benar, response sukses diteruskan ke UI, response gagal ditangani dengan pesan error jelas tanpa memblokir alur manual, dan rate limit per pengguna benar-benar membatasi permintaan berulang

## Out of Scope

- Integrasi API dengan Google Docs, Canva, atau software editing audio/video — hanya field link manual
- Chatbot/asisten AI percakapan bebas — bantuan AI dibatasi ke endpoint tipis dan spesifik tugas
- Penyimpanan riwayat percakapan AI atau personalisasi model dari data historis pengguna
- **Aplikasi mobile native untuk mengelola konten** (membuat/mengedit episode, proyek, outline, dst. dari HP) — tetap di luar cakupan, web app responsif dianggap cukup untuk kerja utama di laptop/tablet. **Catatan:** ini beda dengan companion display TV/tablet (termasuk app Flutter) untuk Mode Eksekusi podcast, yang sudah ada dan sengaja hanya read-only/tampilan pendamping, bukan aplikasi pengelolaan konten.
- Multi-tenant/multi-organisasi (mis. menjual ke pesantren/organisasi lain sebagai SaaS) — ini aplikasi internal untuk satu workspace
- Analytics/growth tooling (GA4, metrik pertumbuhan) — tidak relevan untuk aplikasi internal
- Notifikasi otomatis (email/WhatsApp reminder jadwal rekaman/syuting)
- Publish otomatis ke platform (Spotify/YouTube API) — checklist manual cukup

## Further Notes

- Kandidat fitur v2 (belum disepakati, tidak dikerjakan sekarang): reminder jadwal rekaman/syuting, integrasi API publish otomatis, memperluas bantuan AI ke titik lain di kedua lini (mis. saran judul/deskripsi publish, draft call sheet).
- Precedent internal yang relevan: pola "internal tool tervalidasi lalu digeneralisasi" pernah dicatat di riset workflow vibe coding sebelumnya (lihat `vibe-coding-workflow-dan-peluang-produk.md`, bagian 6.6) — bisa jadi arah lanjutan kalau suatu saat aplikasi ini ingin ditawarkan ke organisasi lain, tapi itu keputusan terpisah yang belum diambil.
- Lihat `README.md` bagian deploy untuk detail operasional terkini (Podman/Quadlet, Cloudflare Tunnel, peringatan soal `docker-compose.yml`) — dokumen ini (PRD) fokus ke keputusan produk/fitur, bukan runbook operasional.
