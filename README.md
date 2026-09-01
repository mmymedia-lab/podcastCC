# Podcast Prep & Execution

Lihat `PRD.md` untuk spesifikasi produk lengkap.

## Deploy di server `yassalam`

Server ini sudah menjalankan service lain (n8n, Postgres, Redis, Home Assistant) via containerd/Tailscale. Stack ini berjalan sebagai set container terpisah, dengan database Postgres sendiri (bukan berbagi instance dengan n8n).

1. Clone repo ini ke server, lalu masuk ke direktorinya.
2. Salin `.env.example` jadi `.env` dan isi nilai sebenarnya (password Postgres, domain Caddy). Jangan commit file `.env`.
3. Jalankan:
   ```
   docker compose up -d db
   docker compose run --rm migrate
   docker compose up -d app caddy
   ```
4. Cek `https://<PODCASTCC_DOMAIN>/api/health` — harus mengembalikan `{"status":"ok"}` yang berarti app sudah terhubung ke database.
5. Akses lewat Tailscale (privat) menggunakan `PODCASTCC_DOMAIN` yang dikonfigurasi di `.env`.

## Development lokal

```
npm install
cp .env.example .env   # sesuaikan DATABASE_URL ke Postgres lokal/dev
npx prisma generate
npm run dev
```
