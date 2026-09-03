# Catatan untuk Agen Lain — Testing via Browser Automation

**Konteks:** Selama testing manual menyeluruh podcastCC (semua 18 fitur PRD) lewat
browser otomatis (Claude in Chrome), ditemukan gangguan berulang di beberapa halaman.
Catatan ini menjelaskan gejalanya, root cause-nya, dan cara mengatasinya — supaya agen
lain tidak salah menyimpulkan ini sebagai bug aplikasi.

---

## Gejala

Di beberapa halaman (Outline, Pertanyaan Narasumber, Rundown, Checklist per-kategori,
Publish & Distribusi), interaksi lewat automation gagal total:
- Klik pakai koordinat pixel dari screenshot **meleset dari elemen targetnya**.
- Klik pakai `ref` hasil `read_page`/`find` **juga tidak selalu fokus/mengenai elemen**
  yang benar — kadang input tidak ter-focus (`document.activeElement` tetap `false`),
  kadang tombol tidak ter-trigger sama sekali.
- Ini terjadi untuk teks input DAN tombol (bukan cuma soal focus field).

## Root cause

`read_page` melaporkan **viewport 2048x1018** (atau serupa), sedangkan screenshot yang
diambil berukuran **1568x753** (atau serupa) — ada mismatch skala antara ruang koordinat
yang dipakai untuk screenshot vs. ruang koordinat yang dipakai untuk dispatch event
klik/keyboard. Ini kemungkinan besar dipicu oleh **display scaling di OS Windows**
tempat Chrome (yang terhubung ke ekstensi Claude in Chrome) berjalan — bukan sesuatu
yang dikontrol atau disebabkan oleh kode aplikasi podcastCC.

**Cara konfirmasi cepat:** jalankan `read_page` dan bandingkan baris `Viewport: WxH`
dengan resolusi screenshot yang baru diambil. Kalau tidak sama, ini masalah environment
browser, bukan aplikasi.

## Cara mengatasi (workaround yang terbukti reliable)

Kalau click/type lewat `computer` tool (baik koordinat maupun `ref`) tidak berefek sama
sekali (dicek via `document.activeElement` atau baca `.value` field setelah "mengetik"),
langsung fallback ke eksekusi JavaScript langsung lewat `javascript_tool`:

```js
// Set value textarea/input dengan benar memicu React onChange:
function setVal(el, val) {
  const proto = el.tagName === 'TEXTAREA'
    ? window.HTMLTextAreaElement.prototype
    : window.HTMLInputElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(proto, 'value').set;
  setter.call(el, val);
  el.dispatchEvent(new Event('input', { bubbles: true }));
}
const el = document.getElementById('nama-id-field');
setVal(el, 'isi yang mau diketik');
el.form.requestSubmit(); // submit form React Server Action
```

Untuk tombol biasa (bukan input), cukup cari elemen via `querySelector`/`textContent`
lalu `.click()` langsung di JS — tidak perlu simulasi mouse.

**Penting:** setelah pakai workaround ini, **selalu verifikasi hasilnya lewat full page
reload/navigate ulang** (bukan cuma baca state di memori/DOM saat itu), supaya yakin
datanya benar tersimpan di database lewat server action, bukan cuma berubah di client
state sesaat.

## Kesalahan diagnostik yang perlu dihindari

`document.body.innerText` **tidak pernah menampilkan `.value` dari `<input>`/`<textarea>`**
(value bukan bagian dari text content DOM). Kalau mau cek apakah suatu input field terisi,
selalu baca `element.value` langsung, jangan andalkan `innerText`. Salah pakai ini sempat
bikin kesimpulan salah di sesi sebelumnya (mengira data tidak tersimpan, padahal cuma cara
cek-nya yang keliru).

## Terkait

Beberapa tombol icon-only (`↑↓☐`) di app ini juga diperbaiki aksesibilitasnya (lihat
`CHANGES_ACCESSIBILITY.md`) — itu perbaikan aksesibilitas yang memang perlu, **bukan**
fix untuk masalah viewport-mismatch di atas (dua hal yang independen).
