import { requireSession, resolveUserId } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getWorkspaceSettings } from "@/lib/workspace-settings";
import { clearGeminiApiKeyAction, setGeminiApiKeyAction, updateWorkspaceModeAction } from "./actions";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { BUTTON_DANGER, BUTTON_PRIMARY, CARD, FIELD_GROUP, FORM, H1, H2, HELP_TEXT, INPUT, LABEL, PAGE } from "@/lib/ui-classes";

export default async function SettingsPage() {
  const session = await requireSession();
  const settings = await getWorkspaceSettings();
  const userId = await resolveUserId(session);
  const user = userId
    ? await prisma.user.findUnique({ where: { id: userId }, select: { geminiApiKeyEncrypted: true } })
    : null;
  const hasGeminiApiKey = Boolean(user?.geminiApiKeyEncrypted);

  return (
    <main className={PAGE}>
      <Breadcrumb items={[{ label: "Beranda", href: "/dashboard" }, { label: "Pengaturan" }]} />
      <h1 className={H1}>Pengaturan Workspace</h1>
      <p className="mb-4 text-sm text-slate-600">
        Mode saat ini: <strong className="text-slate-900">{settings.mode === "SOLO" ? "Solo" : "Tim"}</strong>
      </p>
      <form action={updateWorkspaceModeAction} className={CARD}>
        <fieldset>
          <legend className="mb-3 text-sm font-medium text-slate-700">Skala pengguna</legend>
          <label className="mb-3 flex items-start gap-2 text-sm text-slate-700">
            <input
              type="radio"
              name="mode"
              value="SOLO"
              defaultChecked={settings.mode === "SOLO"}
              className="mt-1"
            />
            <span>Solo — satu orang memegang semua peran, tanpa board status</span>
          </label>
          <label className="mb-4 flex items-start gap-2 text-sm text-slate-700">
            <input
              type="radio"
              name="mode"
              value="TIM"
              defaultChecked={settings.mode === "TIM"}
              className="mt-1"
            />
            <span>Tim — ada peran producer/host/editor & board status per episode</span>
          </label>
        </fieldset>
        <button type="submit" className={BUTTON_PRIMARY}>
          Simpan
        </button>
      </form>

      <h2 className={H2}>API Key Gemini Kamu</h2>
      <div className={CARD}>
        <p className="mb-3 text-sm text-slate-600">
          Status:{" "}
          <strong className="text-slate-900">
            {hasGeminiApiKey ? "Sudah diset" : "Belum diset (pakai key workspace)"}
          </strong>
        </p>
        <form action={setGeminiApiKeyAction} className={FORM}>
          <div className={FIELD_GROUP}>
            <label htmlFor="geminiApiKey" className={LABEL}>
              {hasGeminiApiKey ? "Ganti API key" : "Set API key"}
            </label>
            <input
              id="geminiApiKey"
              name="geminiApiKey"
              type="password"
              autoComplete="off"
              placeholder="AIza..."
              className={INPUT}
            />
            <p className={HELP_TEXT}>
              Key disimpan terenkripsi dan tidak pernah ditampilkan kembali. Kosongkan field ini bila
              tidak ingin mengubahnya.
            </p>
          </div>
          <button type="submit" className={BUTTON_PRIMARY}>
            Simpan API Key
          </button>
        </form>
        {hasGeminiApiKey && (
          <form action={clearGeminiApiKeyAction} className="mt-3">
            <button type="submit" className={BUTTON_DANGER}>
              Hapus API Key
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
