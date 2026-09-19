// One-time helper to get a Google OAuth refresh token for the account that
// will own the app's Drive folder creation (see lib/google-drive.ts). Run
// this locally on your own machine — NOT on the server — since it needs an
// interactive browser login as the nominated Google account.
//
// Usage:
//   GOOGLE_OAUTH_CLIENT_ID=... GOOGLE_OAUTH_CLIENT_SECRET=... node scripts/get-google-drive-refresh-token.mjs
//
// It opens a local HTTP server on the loopback address (the flow Google's
// "Desktop app" OAuth client type expects — no redirect URI needs to be
// pre-registered for this), prints a consent URL to open in your browser,
// and prints the resulting refresh token once you approve access.
import { createServer } from "node:http";
import { google } from "googleapis";

const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
if (!clientId || !clientSecret) {
  console.error("Set GOOGLE_OAUTH_CLIENT_ID and GOOGLE_OAUTH_CLIENT_SECRET first.");
  process.exit(1);
}

const PORT = 53682;
const redirectUri = `http://127.0.0.1:${PORT}/oauth2callback`;
const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);

// drive.file: only the files/folders this app creates — not full Drive access.
const authUrl = oauth2Client.generateAuthUrl({
  access_type: "offline",
  prompt: "consent", // forces a refresh_token even if this account authorized before
  scope: ["https://www.googleapis.com/auth/drive.file"],
});

console.log("\nBuka URL ini di browser, login sebagai akun yang dinominasikan, lalu klik Allow:\n");
console.log(authUrl + "\n");

const server = createServer(async (req, res) => {
  if (!req.url?.startsWith("/oauth2callback")) {
    res.writeHead(404).end();
    return;
  }

  const code = new URL(req.url, redirectUri).searchParams.get("code");
  if (!code) {
    res.writeHead(400).end("Missing ?code");
    return;
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);
    res.writeHead(200, { "Content-Type": "text/plain" }).end(
      "Berhasil. Kamu bisa menutup tab ini dan kembali ke terminal.",
    );
    console.log("\nGOOGLE_OAUTH_REFRESH_TOKEN=" + tokens.refresh_token + "\n");
    console.log("Simpan nilai di atas ke .env server, lalu hentikan script ini (Ctrl+C).");
  } catch (error) {
    res.writeHead(500).end("Token exchange failed, see terminal.");
    console.error("Gagal menukar kode dengan token:", error);
  } finally {
    server.close();
  }
});

server.listen(PORT, "127.0.0.1");
