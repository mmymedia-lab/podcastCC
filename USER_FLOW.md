# User Flow — Podcast Prep & Execution

Diagram alur navigasi aplikasi, ditulis retroaktif untuk mengisi gap fase **5 — Desain & User Flow** (dilewati saat awal build, langsung ke PRD → coding). Berguna untuk onboarding kontributor baru dan referensi kalau ada perubahan struktur navigasi nanti.

## Alur Utama

```mermaid
flowchart TD
    Login["/login"] --> Dashboard["/dashboard"]
    Dashboard --> Settings["/settings — pilih mode Solo/Tim"]
    Dashboard --> BankTema["/bank-tema"]
    Dashboard --> Episodes["/episodes — daftar episode"]
    Dashboard -->|mode Tim saja| Board["/board — Kanban per tahap"]

    BankTema -->|tambah ide + tag| BankTema
    BankTema -->|"Minta ide AI"| BankTema
    BankTema -->|"Jadikan Episode"| EpisodeDetail

    Episodes --> EpisodeDetail["/episodes/[id] — hub episode"]

    EpisodeDetail --> Outline["/outline — poin bicara + referensi"]
    EpisodeDetail --> GuestQ["/guest-questions"]
    EpisodeDetail -->|mode Tim saja| Roles["/roles — assign Producer/Host/Editor"]

    Outline -->|"Draft dengan AI"| Outline
    EpisodeDetail --> ChecklistPra["/checklist/pra-produksi"]
    EpisodeDetail --> Guests["/guests — kontak & briefing tamu"]
    EpisodeDetail -->|isi jadwal rekaman| EpisodeDetail

    EpisodeDetail --> Rundown["/rundown — susun segmen"]
    Rundown --> Execute["/execute — mode full-screen + timer (hari-H)"]

    EpisodeDetail --> ChecklistPasca["/checklist/pasca-produksi"]
    EpisodeDetail --> Timestamps["/timestamps"]
    EpisodeDetail --> ShowNotes["/show-notes"]
    ShowNotes -->|"Draft show notes dengan AI"| ShowNotes

    EpisodeDetail --> ChecklistPublish["/checklist/publish"]
    EpisodeDetail --> Publish["/publish — metadata"]

    EpisodeDetail --> Evaluation["/evaluation"]
    Evaluation -->|"ide follow-up"| BankTema
```

## Catatan per Tahap

| Tahap PRD | Halaman | Siapa yang biasanya pegang (mode Tim) |
|---|---|---|
| Bank Tema | `/bank-tema` | siapa saja |
| Riset & Outline | `/outline`, `/guest-questions` | Host |
| Pra-Produksi | `/checklist/pra-produksi`, `/guests`, jadwal di hub episode | Host |
| Panduan Eksekusi | `/rundown` (susun), `/execute` (hari-H) | Host |
| Pasca-Produksi | `/checklist/pasca-produksi`, `/timestamps`, `/show-notes` | Editor |
| Publish & Distribusi | `/checklist/publish`, `/publish` | Editor |
| Evaluasi | `/evaluation` | siapa saja |

Producer bisa akses semua tahap di atas (lihat `lib/permissions.ts`). Di mode Solo, kolom "siapa pegang" tidak berlaku — satu akun pegang semua tahap.

## Yang Sengaja Tidak Digambar

- Halaman edit (`/outline/[itemId]/edit`, dst.) — variasi CRUD standar dari halaman list-nya masing-masing, tidak menambah pemahaman alur baru.
- Endpoint AI (`/api/ai/*`) — dipanggil dari tombol di halaman terkait (Bank Tema, Outline, Show Notes), bukan halaman terpisah yang dinavigasi user.
