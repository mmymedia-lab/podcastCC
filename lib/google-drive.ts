import { google } from "googleapis";

export interface DriveFolder {
  id: string;
  url: string;
}

/**
 * Auth is a Google OAuth refresh token for a nominated human account (see
 * scripts/get-google-drive-refresh-token.mjs) rather than a service-account
 * key — the organization's Google Cloud policy
 * (iam.disableServiceAccountKeyCreation) blocks issuing those.
 *
 * Returns null if any of the 4 required env vars is missing, so callers can
 * soft-fail the same way regardless of which Drive operation they're doing.
 */
function getDriveClient() {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_OAUTH_REFRESH_TOKEN;
  if (!clientId || !clientSecret || !refreshToken) return null;

  const auth = new google.auth.OAuth2(clientId, clientSecret);
  auth.setCredentials({ refresh_token: refreshToken });
  return google.drive({ version: "v3", auth });
}

/**
 * Creates a folder named after the project inside the team's existing
 * Shared Drive.
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
export async function createProjectDriveFolder(projectTitle: string): Promise<DriveFolder | null> {
  const sharedDriveId = process.env.GOOGLE_DRIVE_SHARED_DRIVE_ID;
  const drive = getDriveClient();
  if (!drive || !sharedDriveId) {
    console.warn("Integrasi Google Drive belum dikonfigurasi, lewati pembuatan folder.");
    return null;
  }

  try {
    const folder = await drive.files.create({
      requestBody: {
        name: projectTitle,
        mimeType: "application/vnd.google-apps.folder",
        parents: [sharedDriveId],
      },
      fields: "id, webViewLink",
      supportsAllDrives: true,
    });

    if (!folder.data.id || !folder.data.webViewLink) return null;
    return { id: folder.data.id, url: folder.data.webViewLink };
  } catch (error) {
    console.error("Gagal membuat folder Google Drive untuk project:", error);
    return null;
  }
}

/**
 * Moves a project's Drive folder to trash (recoverable from Drive's Trash
 * for the usual retention window, not permanently deleted) when its
 * project is deleted. Soft-fails the same way as creation: a Drive error
 * here must never block deleting the project record itself.
 */
export async function deleteProjectDriveFolder(folderId: string): Promise<void> {
  const drive = getDriveClient();
  if (!drive) {
    console.warn("Integrasi Google Drive belum dikonfigurasi, lewati penghapusan folder.");
    return;
  }

  try {
    await drive.files.update({
      fileId: folderId,
      requestBody: { trashed: true },
      supportsAllDrives: true,
    });
  } catch (error) {
    console.error("Gagal menghapus (trash) folder Google Drive untuk project:", error);
  }
}
