// One-time helper: sign in with the dedicated Google account and print a refresh token for .env.
// Usage: npm run google:auth   (needs GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env)
import http from "node:http";
import { auth, drive as googleDrive } from "@googleapis/drive";

const PORT = 5555;
const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_DRIVE_FOLDER_ID } = process.env;

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
  console.error("Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env first.");
  process.exit(1);
}

const client = new auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, `http://127.0.0.1:${PORT}`);
const authUrl = client.generateAuthUrl({
  access_type: "offline",
  prompt: "consent", // always return a refresh token
  scope: ["https://www.googleapis.com/auth/drive"],
});

const server = http.createServer(async (req, res) => {
  const code = new URL(req.url ?? "/", `http://127.0.0.1:${PORT}`).searchParams.get("code");
  if (!code) {
    res.writeHead(400).end("No authorization code received.");
    return;
  }

  try {
    const { tokens } = await client.getToken(code);
    res.writeHead(200, { "Content-Type": "text/plain" }).end("Done. You can close this tab and return to the terminal.");

    if (!tokens.refresh_token) throw new Error("Google did not return a refresh token. Run the script again.");
    console.log("\nAdd this line to your .env:\n");
    console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}\n`);

    if (GOOGLE_DRIVE_FOLDER_ID) {
      client.setCredentials(tokens);
      const folder = await googleDrive({ version: "v3", auth: client }).files.get({
        fileId: GOOGLE_DRIVE_FOLDER_ID,
        fields: "name, mimeType",
        supportsAllDrives: true,
      });
      console.log(`Folder check OK: "${folder.data.name}" is accessible.`);
    }
  } catch (error) {
    console.error("Failed:", error instanceof Error ? error.message : error);
    if (!res.headersSent) res.writeHead(500).end("Failed. See the terminal for details.");
  } finally {
    server.close();
  }
});

server.listen(PORT, "127.0.0.1", () => {
  console.log("Open this URL in your browser and sign in with the dedicated Google account:\n");
  console.log(authUrl + "\n");
});
