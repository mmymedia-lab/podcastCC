# Catatan Bug & Perbaikan — Deploy Pertama ke Podman (yassalam)

Ditemukan saat deploy pertama `main` branch ke server `yassalam` pakai Podman rootless
(2026-09-02). Referensi lengkap: `git diff` di working tree ini (belum di-commit).

---

## Bug asli di repo (berlaku untuk Docker maupun Podman — sebaiknya di-merge)

### 1. `Dockerfile` — Prisma engine gagal karena OpenSSL tidak ada

**Gejala:** `prisma migrate deploy` gagal dengan error yang tidak jelas:
```
Error: Could not parse schema engine response: SyntaxError: Unexpected token 'E', "Error load"... is not valid JSON
```
Disertai warning yang sebenarnya kunci masalahnya:
```
prisma:warn Prisma failed to detect the libssl/openssl version to use...
Please manually install OpenSSL and try installing Prisma again.
```

**Sebab:** base image `node:20-alpine` tidak menyertakan `openssl`. Prisma's query/schema-engine
adalah binary Rust yang link dinamis ke libssl — tanpa itu, binary-nya gagal start sama sekali
(bukan gagal karena skema/SQL, seperti dugaan awal di catatan deploy).

**Fix** — tambahkan di stage `builder` dan `runner`:
```dockerfile
FROM node:20-alpine AS builder
RUN apk add --no-cache openssl
WORKDIR /app
...

FROM node:20-alpine AS runner
RUN apk add --no-cache openssl
WORKDIR /app
...
```
(Stage `deps` tidak perlu — tidak menjalankan Prisma CLI.)

**Dampak kalau tidak di-fix:** migrate gagal total di deployment manapun (bukan cuma Podman),
begitu juga `app` runtime kemungkinan besar juga akan gagal query database di production
karena query-engine yang sama dipakai saat runtime.

---

### 2. `docker-compose.yml` — service `caddy` tidak dapat env var, `$PODCASTCC_DOMAIN` kosong

**Gejala:** Caddy crash-loop:
```
Error: adapting config using caddyfile: /etc/caddy/Caddyfile:4: unrecognized global option: tls
```

**Sebab:** service `caddy` di `docker-compose.yml` tidak punya `env_file:` atau `environment:`
sama sekali. Jadi `{$PODCASTCC_DOMAIN}` di baris pertama `Caddyfile` resolve ke string kosong.
Caddy lalu membaca `{ ... }` (tanpa alamat di depan) sebagai **global options block**, bukan
site block — dan `tls` bukan directive global yang valid, makanya errornya soal "global option"
walaupun letak `tls`-nya sudah benar di dalam block.

**Fix:**
```yaml
  caddy:
    image: caddy:2-alpine
    restart: unless-stopped
    depends_on:
      - app
    env_file:
      - .env          # <-- baris yang kurang
    ports:
      ...
```

**Dampak kalau tidak di-fix:** Caddy selalu gagal start di deployment manapun yang benar-benar
menjalankan `docker-compose.yml` ini apa adanya — bug ini independen dari Podman vs Docker.

---

### 3. `.env.example` — format quoted value pecah saat dipakai lewat `--env-file`

**Gejala:** Prisma menolak `DATABASE_URL` dengan pesan:
```
error: Error validating datasource `db`: the URL must start with the protocol `postgresql://` or `postgres://`.
```
...padahal isinya memang diawali `postgresql://`.

**Sebab:** `.env.example` (dan `.env` yang dibuat mengikuti formatnya) menulis value dengan tanda
kutip: `DATABASE_URL="postgresql://..."`. `docker run --env-file` / `podman run --env-file`
**tidak** melakukan shell-style unquoting — tanda kutip ikut terbawa jadi bagian literal value.
Jadi yang diterima Prisma sebenarnya adalah string yang **diawali karakter `"`**, bukan `p`.

**Fix:** hilangkan semua tanda kutip di `.env` / `.env.example`:
```diff
- DATABASE_URL="postgresql://podcastcc:changeme@db:5432/podcastcc"
+ DATABASE_URL=postgresql://podcastcc:changeme@db:5432/podcastcc
```
Berlaku untuk semua baris di `.env.example` (`POSTGRES_PASSWORD`, `PODCASTCC_DOMAIN`,
`NEXTAUTH_SECRET`, dst).

**Catatan:** ini bukan bug spesifik Podman — `docker compose` sendiri (v1 maupun v2) juga
tidak strip kutip dari `env_file:`. Siapa pun yang generate `.env` dari template berkutip ini
lalu menjalankannya lewat `env_file:`/`--env-file` akan kena masalah yang sama.

---

## Adaptasi khusus deployment ini (BUKAN bug repo — jangan langsung di-hardcode ke `main`)

Dua perubahan berikut murni karena kondisi server `yassalam` (port 80/443 sudah dipakai service
lain, akses harus privat lewat Tailscale saja) — bukan sesuatu yang salah di kode aslinya:

### `docker-compose.yml` — port Caddy 443/80 → 8443 saja
```diff
    ports:
-     - "443:443"
-     - "80:80"
+     - "8443:443"
```
Port 80 dihapus total (tidak perlu untuk ACME karena pakai `tls internal`, lihat di bawah).

### `Caddyfile` — `tls internal` (self-signed) alih-alih Let's Encrypt otomatis
```diff
  {$PODCASTCC_DOMAIN} {
+     tls internal
      reverse_proxy app:3000
  }
```
Domain privat Tailscale (`*.ts.net`) tidak bisa diverifikasi ACME publik tanpa expose ke
internet — jadi pakai CA internal Caddy (browser akan warning cert tidak trusted sekali,
bisa di-trust manual).

**Saran untuk repo:** kalau mau dukung banyak skenario deploy (port lain sudah kepakai, atau
publik vs privat), sebaiknya port host dan `tls internal` vs ACME dibuat bisa dikonfigurasi lewat
env var (mis. `CADDY_HTTPS_PORT`, `CADDY_TLS_MODE`), bukan nilai tetap di `docker-compose.yml`/
`Caddyfile`. Untuk sekarang saya hardcode langsung supaya deploy jalan.

---

## Ringkasan file yang berubah
```
 Caddyfile          | 3 +++
 Dockerfile         | 6 ++++++
 docker-compose.yml | 8 ++++++--
 3 files changed, 15 insertions(+), 2 deletions(-)
```
Full diff: `git diff` di `/home/fahmi/podcastcc` (belum di-commit, masih di working tree).
