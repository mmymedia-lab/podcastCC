export type OnboardingStep = {
  title: string;
  description: string;
  image?: string;
};

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    title: "Selamat datang di Podcast Prep & Execution",
    description:
      "Ini alat bantu internal untuk menyiapkan dan menjalankan produksi podcast, dari ide topik sampai evaluasi pasca-tayang. Dari Dashboard kamu bisa masuk ke Bank Tema, Episode, Pengaturan, dan Pengguna.",
    image: "/onboarding/01-dashboard.png",
  },
  {
    title: "Bank Tema: kumpulan ide topik",
    description:
      "Sebelum jadi episode, ide topik dikumpulkan di sini. Bisa ditulis manual, atau minta beberapa ide dari AI dengan kata kunci — tinggal klik \"+ Tambah\" untuk memasukkan ide yang dipilih.",
    image: "/onboarding/02-bank-tema.png",
  },
  {
    title: "Setiap episode berjalan lewat 7 tahap",
    description:
      "Bank Tema → Riset & Outline → Pra-Produksi → Panduan Eksekusi → Pasca-Produksi → Publish & Distribusi → Evaluasi. Halaman detail episode jadi pusat untuk masuk ke tiap tahap.",
    image: "/onboarding/03-episode-detail.png",
  },
  {
    title: "Riset & Outline, dibantu AI",
    description:
      "Susun poin bicara untuk episode. Tombol \"Draft dengan AI\" bisa bikinkan draf outline otomatis, dan tombol salin (📋) memudahkan menyalin hasilnya ke tempat lain.",
    image: "/onboarding/04-outline-ai.png",
  },
  {
    title: "Rundown & Mode Eksekusi",
    description:
      "Susun segmen rundown, lalu buka Mode Eksekusi saat rekaman berlangsung — layar penuh gelap dengan timer berjalan dan poin bicara, supaya fokus tanpa gangguan. Tombol \"✕ Keluar\" di pojok kanan atas untuk balik ke Rundown.",
    image: "/onboarding/05-execute-mode.png",
  },
  {
    title: "Pasca-produksi: Show Notes, Publish, Evaluasi",
    description:
      "Setelah rekaman selesai, buat draf show notes (bisa dibantu AI juga), isi judul/deskripsi untuk publish, dan catat evaluasi supaya jadi bahan perbaikan episode berikutnya.",
    image: "/onboarding/06-show-notes.png",
  },
  {
    title: "Pengaturan & Pengguna",
    description:
      "Di Pengaturan, atur mode Solo/Tim dan API key Gemini pribadi (opsional — kalau tidak diisi, pakai key workspace bersama). Di Pengguna, kelola akun anggota tim yang punya akses ke aplikasi ini.",
    image: "/onboarding/07-settings.png",
  },
  {
    title: "Siap mulai!",
    description:
      "Panduan ini bisa dibuka lagi kapan saja lewat link \"📖 Panduan\" di bagian atas halaman. Selamat menyiapkan episode berikutnya!",
  },
];
