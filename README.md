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
4. Cek `https://<PODCASTCC_DOMAIN>/api/health` (tambahkan `:<CADDY_HTTPS_PORT>` kalau bukan 443) — harus mengembalikan `{"status":"ok"}` yang berarti app sudah terhubung ke database.
5. Login di `https://<PODCASTCC_DOMAIN>/login` dengan `ADMIN_EMAIL`/`ADMIN_PASSWORD`.
6. Akses lewat Tailscale (privat) menggunakan `PODCASTCC_DOMAIN` yang dikonfigurasi di `.env`.

## Development lokal

```
npm install
cp .env.example .env   # sesuaikan DATABASE_URL ke Postgres lokal/dev
npx prisma generate
npm run dev
```
