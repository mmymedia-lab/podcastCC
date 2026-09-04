# Podcast Prep & Execution

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

   > ⚠️ **Kalau Postgres untuk stack ini dikelola terpisah lewat systemd/Quadlet** (bukan lewat `db` service di compose ini), **JANGAN** jalankan `docker compose up -d db` atau `docker compose run --rm migrate` apa adanya — keduanya bisa membuat container Postgres kedua yang mount volume data yang sama dengan container Quadlet, dan dua proses Postgres menulis ke volume yang sama akan **merusak database** (pernah terjadi di server yassalam). Di setup seperti ini, jalankan image `migrate` langsung (`docker run`/`podman run`, bukan lewat `compose`/`podman-compose`) yang terhubung ke network yang sama dengan container Postgres Quadlet yang sudah jalan, dan pastikan file Quadlet-nya eksplisit set `POSTGRES_USER`/`POSTGRES_DB` (jangan cuma andalkan `.env` yang mungkin tidak dibaca Quadlet).
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
