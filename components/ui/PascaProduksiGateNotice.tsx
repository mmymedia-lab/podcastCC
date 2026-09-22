import { BUTTON_SECONDARY } from "@/lib/ui-classes";

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric" }).format(date);
}

/**
 * Shown wherever Pasca-Produksi content lives (Episode/Project detail
 * pages, and each Pasca-Produksi-gated sub-page itself) so the lock state
 * is visible before someone tries to submit a form and hits a permission
 * error — see getEpisodePascaProduksiGate()/getProjectPascaProduksiGate()
 * in lib/permissions.ts for what unlocks it.
 */
export function PascaProduksiGateNotice({
  unlocked,
  productionDate,
  manualOverride,
  canToggle,
  unlockAction,
  lockAction,
}: {
  unlocked: boolean;
  productionDate: Date | null;
  manualOverride: boolean;
  canToggle: boolean;
  unlockAction: () => Promise<void>;
  lockAction: () => Promise<void>;
}) {
  if (unlocked) {
    return (
      <div className="mb-4 rounded-lg border border-primary-100 bg-primary-50 p-3 text-sm text-primary-800">
        <p>
          ✅ Pasca-Produksi aktif
          {manualOverride
            ? " (dibuka lebih awal secara manual)."
            : productionDate
              ? ` — tanggal produksi (${formatDate(productionDate)}) sudah lewat.`
              : "."}
        </p>
        {canToggle && manualOverride && (
          <form action={lockAction} className="mt-2">
            <button type="submit" className={BUTTON_SECONDARY}>
              Kunci lagi
            </button>
          </form>
        )}
      </div>
    );
  }

  return (
    <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
      <p>
        🔒 Pasca-Produksi belum aktif —{" "}
        {productionDate
          ? `akan otomatis terbuka pada ${formatDate(productionDate)}.`
          : "tanggal produksi belum diisi."}
      </p>
      {canToggle && (
        <form action={unlockAction} className="mt-2">
          <button type="submit" className={BUTTON_SECONDARY}>
            Buka sekarang
          </button>
        </form>
      )}
    </div>
  );
}
