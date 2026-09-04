import { requireSession } from "@/lib/session";
import { getWorkspaceSettings } from "@/lib/workspace-settings";
import { updateWorkspaceModeAction } from "./actions";
import { BUTTON_PRIMARY, CARD, H1, PAGE } from "@/lib/ui-classes";

export default async function SettingsPage() {
  await requireSession();
  const settings = await getWorkspaceSettings();

  return (
    <main className={PAGE}>
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
    </main>
  );
}
