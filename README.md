# Yassalam Media Studio

Lihat `PRD.md` untuk spesifikasi produk lengkap.

## Deploy di server `yassalam`

Server ini sudah menjalankan service lain (n8n, Postgres, Redis, Home Assistant) via containerd/Tailscale. Stack ini berjalan sebagai set container terpisah, dengan database Postgres sendiri (bukan berbagi instance dengan n8n).

1. Clone repo ini ke server, lalu masuk ke direktorinya.
2. Salin `.env.example` jadi `.env` dan isi nilai sebenarnya: password Postgres, domain Caddy, `NEXTAUTH_SECRET` (generate dengan `openssl rand -base64 32`), dan `ADMIN_EMAIL`/`ADMIN_PASSWORD` untuk akun pertama. Jangan commit file `.env`. **Jangan pakai tanda kutip** di sekitar value — `docker`/`podman --env-file` tidak strip kutip, jadi ikut jadi bagian value literal.
   - Kalau `PODCASTCC_DOMAIN` adalah nama privat (mis. Tailscale `*.ts.net`) yang tidak bisa diverifikasi ACME publik, set `PODCASTCC_TLS_MODE=internal` supaya Caddy pakai sertifikat self-signed dari CA internalnya sendiri (browser akan warning sekali, bisa di-trust manual). Kosongkan untuk domain publik (Let's Encrypt otomatis).
   - Kalau port 80/443 di host sudah dipakai service lain, set `CADDY_HTTP_PORT`/`CADDY_HTTPS_PORT` ke port lain, dan sesuaikan `NEXTAUTH_URL` supaya menyertakan port itu (mis. `:8443`).
3. Jalankan (ganti `docker compose` dengan `podman-compose` kalau memakai Podman rootless — file compose ini kompatibel dengan keduanya):
   ```
   docker compose up -d db
   docker compose run --rm migrate
   docker compose up -d app caddy
   ```
   Langkah `migrate` menjalankan migrasi database sekaligus membuat akun `ADMIN_EMAIL`/`ADMIN_PASSWORD` (kalau belum ada).

   > ⚠️ **Kalau stack ini di server tertentu dikelola lewat systemd/Quadlet** (seperti di server yassalam — lihat `*.container` di `~/.config/containers/systemd/`), **JANGAN jalankan perintah `docker compose`/`podman-compose` apa pun** (`up`, `down`, `run`, termasuk hanya `up -d app` tanpa menyentuh `db`) **di direktori ini pada server itu** — bukan cuma soal `migrate`/`db`:
   >
   > - **Insiden #1** (Postgres corruption): `docker compose run --rm migrate` atau `up -d db` membuat container Postgres kedua yang mount volume data yang sama dengan container Quadlet — dua proses Postgres menulis ke volume yang sama merusak database.
   > - **Insiden #2** (full-stack restart, 2026-09-18): sekalipun cuma `up -d app` lalu `down --volumes` (tanpa `db`), Compose **secara default** membentuk nama network/volume dari `<nama-folder>_<key>` — karena folder ini bernama `podcastcc`, network/volume yang lama (sebelum diganti) jadi persis sama namanya dengan resource yang dipakai Quadlet (`podcastcc_podcastcc`, `podcastcc_podcastcc_db_data`, dst). `down --volumes` yang membongkar resource "miliknya sendiri" ternyata membongkar resource **production** juga, memicu ke-4 service Quadlet mati lalu auto-restart bersamaan (data ternyata tidak hilang — Postgres shutdown bersih dan volume production tidak ikut terhapus — tapi tetap downtime singkat yang tidak disengaja).
   >   Sejak insiden #2, network/volume di `docker-compose.yml` sudah di-rename (`podcastcc-compose`, `podcastcc_compose_*_data`) supaya tidak collision lagi — tapi tetap **jangan jalankan compose apa pun di server yang sudah pakai Quadlet**, karena container Postgres-nya sendiri masih bisa mount volume Quadlet lewat mekanisme lain (`migrate`/`db` service) kalau file compose berubah lagi di masa depan.
   >
   > Di server yang pakai Quadlet, jalankan `migrate` langsung lewat `docker run`/`podman run` (bukan lewat `compose`/`podman-compose`) yang terhubung ke network yang sama dengan container Postgres Quadlet yang sudah jalan, dan pastikan file Quadlet-nya eksplisit set `POSTGRES_USER`/`POSTGRES_DB` (jangan cuma andalkan `.env` yang mungkin tidak dibaca Quadlet). File `docker-compose.yml` ini hanya aman dipakai di server/mesin yang **tidak** menjalankan stack ini lewat Quadlet (misalnya environment dev/staging terpisah).
4. Cek `https://<PODCASTCC_DOMAIN>/api/health` (tambahkan `:<CADDY_HTTPS_PORT>` kalau bukan 443) — harus mengembalikan `{"status":"ok"}` yang berarti app sudah terhubung ke database.
5. Login di `https://<PODCASTCC_DOMAIN>/login` dengan `ADMIN_EMAIL`/`ADMIN_PASSWORD`.
6. Akses lewat Tailscale (privat) menggunakan `PODCASTCC_DOMAIN` yang dikonfigurasi di `.env`.

## Update deployment yang sudah jalan

1. `git pull origin main` (atau `git fetch` + fast-forward branch deploy kalau servernya checkout branch tertentu).
2. Bandingkan `.env.example` dengan `.env` di server — env var baru yang ditambahkan seiring fitur baru **tidak otomatis ikut ter-pull** (`.env` di-gitignore). Contoh: `ENCRYPTION_KEY` (untuk enkripsi API key Gemini per-user, generate dengan `openssl rand -base64 32`, jangan sama dengan `NEXTAUTH_SECRET`).
3. Rebuild image yang berubah: `docker compose build app migrate`.
4. Jalankan migrasi database — ikuti catatan Quadlet di langkah 3 bagian "Deploy" di atas kalau relevan untuk server ini.
5. Restart `app`: `docker compose up -d app` (biasanya `db` dan `caddy` tidak perlu disentuh).
6. Uji coba: health check, login, lalu cek halaman yang terkait fitur baru.

## Development lokal

```
npm install
cp .env.example .env   # sesuaikan DATABASE_URL ke Postgres lokal/dev
npx prisma generate
npm run dev
```
