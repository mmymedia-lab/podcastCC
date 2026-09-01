import { requireSession } from "@/lib/session";
import { getWorkspaceSettings } from "@/lib/workspace-settings";
import { updateWorkspaceModeAction } from "./actions";

export default async function SettingsPage() {
  await requireSession();
  const settings = await getWorkspaceSettings();

  return (
    <main>
      <h1>Pengaturan Workspace</h1>
      <p>
        Mode saat ini: <strong>{settings.mode === "SOLO" ? "Solo" : "Tim"}</strong>
      </p>
      <form action={updateWorkspaceModeAction}>
        <fieldset>
          <legend>Skala pengguna</legend>
          <label>
            <input
              type="radio"
              name="mode"
              value="SOLO"
              defaultChecked={settings.mode === "SOLO"}
            />
            Solo — satu orang memegang semua peran, tanpa board status
          </label>
          <label>
            <input
              type="radio"
              name="mode"
              value="TIM"
              defaultChecked={settings.mode === "TIM"}
            />
            Tim — ada peran producer/host/editor & board status per episode
          </label>
        </fieldset>
        <button type="submit">Simpan</button>
      </form>
    </main>
  );
}
