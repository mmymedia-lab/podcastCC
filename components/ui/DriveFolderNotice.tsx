// Shown on both the Project detail page (near "Peran Tim") and the
// Storyboard page. The app only creates the folder — granting the
// selected team access to it is a manual step for Leader Produksi in
// Google Drive itself, so this always pairs the link with that reminder.
export function DriveFolderNotice({ driveFolderUrl }: { driveFolderUrl: string | null }) {
  if (!driveFolderUrl) {
    return (
      <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        Folder Google Drive belum tersedia untuk project ini (integrasi Drive belum dikonfigurasi, atau
        pembuatan folder sempat gagal saat project dibuat).
      </div>
    );
  }

  return (
    <div className="mb-4 rounded-lg border border-primary-100 bg-primary-50 p-4">
      <p className="text-sm font-medium text-primary-800">Folder Google Drive project ini:</p>
      <a
        href={driveFolderUrl}
        target="_blank"
        rel="noreferrer"
        className="mt-1 block break-all text-sm text-primary-700 hover:underline"
      >
        {driveFolderUrl}
      </a>
      <p className="mt-2 text-sm text-slate-700">
        <strong>Pengingat untuk Leader Produksi:</strong> setelah tim project ini dipilih di{" "}
        <em>Peran Tim</em>, tambahkan akses mereka secara manual ke folder ini lewat Google Drive
        (klik kanan folder → Share).
      </p>
    </div>
  );
}
