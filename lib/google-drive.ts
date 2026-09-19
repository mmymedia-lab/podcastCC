import { google } from "googleapis";

/**
 * Creates a folder named after the project inside the team's existing
 * Shared Drive. Auth is a Google OAuth refresh token for a nominated human
 * account (see scripts/get-google-drive-refresh-token.mjs) rather than a
 * service-account key — the organization's Google Cloud policy
 * (iam.disableServiceAccountKeyCreation) blocks issuing those.
 *
 * Deliberately soft-fails (logs, returns null) instead of throwing: a
 * misconfigured/missing Drive integration must never block creating a
 * project, matching how the Gemini AI-assist features degrade (see
 * lib/gemini.ts).
 *
 * The app only creates the folder — it does not manage who has access to
 * it. Granting the selected team access is a manual step for Leader
 * Produksi in Google Drive itself (see the reminder shown next to the
 * folder link in the UI).
 */
export async function createProjectDriveFolder(projectTitle: string): Promise<string | null> {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_OAUTH_REFRESH_TOKEN;
  const sharedDriveId = process.env.GOOGLE_DRIVE_SHARED_DRIVE_ID;

  if (!clientId || !clientSecret || !refreshToken || !sharedDriveId) {
    console.warn("Integrasi Google Drive belum dikonfigurasi, lewati pembuatan folder.");
    return null;
  }

  try {
    const auth = new google.auth.OAuth2(clientId, clientSecret);
    auth.setCredentials({ refresh_token: refreshToken });
    const drive = google.drive({ version: "v3", auth });

    const folder = await drive.files.create({
      requestBody: {
        name: projectTitle,
        mimeType: "application/vnd.google-apps.folder",
        parents: [sharedDriveId],
      },
      fields: "id, webViewLink",
      supportsAllDrives: true,
    });

    return folder.data.webViewLink ?? null;
  } catch (error) {
    console.error("Gagal membuat folder Google Drive untuk project:", error);
    return null;
  }
}
