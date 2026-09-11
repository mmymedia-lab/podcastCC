# Feature Request: Timer Mode Eksekusi harus dimulai manual (tombol Play)

## Perilaku saat ini

Di `app/episodes/[id]/execute/execute-client.tsx`, timer/countdown segmen
langsung berjalan otomatis begitu Mode Eksekusi dibuka atau host pindah ke
segmen berikutnya:

```ts
const [segmentStartedAt, setSegmentStartedAt] = useState(() => Date.now());
...
useEffect(() => {
  const tick = () => setElapsedMs(Date.now() - segmentStartedAt);
  tick();
  const interval = setInterval(tick, 250);
  return () => clearInterval(interval);
}, [segmentStartedAt]);
```

Tidak ada gating apa pun — timer jalan tanpa menunggu host menekan tombol apa
pun, dan tanpa peduli apakah ada TV/tablet companion yang terhubung (fitur
pairing TV dari PR #57 hanya mempublikasikan state, tidak mengontrol kapan
timer mulai).

## Perilaku yang diminta

Timer **tidak boleh** mulai otomatis. Setiap kali host masuk ke sebuah
segmen (baik segmen pertama saat Mode Eksekusi dibuka, maupun saat pindah
segmen), tampilan harus diam di `00:00` sampai host menekan tombol **Play**
secara eksplisit. Setelah ditekan, baru timer berjalan dari 0 untuk segmen
tersebut.

## Implementasi yang diterapkan (server yassalam, akan divalidasi lagi saat sinkron dengan PR upstream)

1. `execute-client.tsx`: tambah state `isRunning` (default `false`). Efek
   tick di-gate oleh `isRunning`. Tombol "▶ Mulai Segmen Ini" muncul saat
   belum jalan; menekannya men-set `segmentStartedAt = Date.now()` dan
   `isRunning = true`. Pindah segmen (`goToSegment`) mereset `isRunning`
   ke `false` lagi (host harus tekan Play lagi per segmen).
2. `app/api/rundown-segments/[segmentId]/activate/route.ts`: PATCH sekarang
   menerima body `{ started: boolean }`. Saat `started: false` (default,
   dipanggil ketika segmen berganti), `activeSegmentStartedAt` diset ke
   `null` di DB — companion display tahu segmen ini belum berjalan. Saat
   host menekan Play, client memanggil ulang dengan `{ started: true }`
   sehingga `activeSegmentStartedAt` diisi timestamp sebenarnya.
3. `app/tv/[code]/tv-display-client.tsx` dan
   `app/api/tv/session/[code]/route.ts`: `segmentStartedAt` sekarang bisa
   `null`. TV/companion display menampilkan "Menunggu host memulai segmen
   ini..." selama `null`, dan baru mulai tick begitu ada timestamp.

## Catatan untuk dev agent

Perubahan ini diterapkan langsung di server produksi (`yassalam`) karena
diminta user secara eksplisit, di luar alur PR biasa. Mohon disinkronkan
ke repo utama supaya tidak konflik/ke-overwrite oleh deploy PR berikutnya.
Diminta oleh: mmy.media@yassalam.id.
