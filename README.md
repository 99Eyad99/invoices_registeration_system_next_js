# Invoice Management

A simple Next.js (App Router, TypeScript) app to upload, search, view and download invoices.
Invoice files are stored in Google Drive; invoice metadata is stored in MongoDB Atlas (free tier) via Prisma.
The UI uses Ant Design and Ant Design Icons. All pages require login.

## 1. Installation

Requires Node.js 20.9 or newer.

```bash
npm install
cp .env.example .env
```

## 2. Environment variables

All configuration comes from `.env` (or `.env.local`). Nothing environment-specific is hardcoded.

| Variable | Description |
| --- | --- |
| `NEXT_PUBLIC_APP_NAME` | App name shown in the header and page title. |
| `GOOGLE_DRIVE_FOLDER_ID` | ID of the Drive folder where invoice files are uploaded. |
| `GOOGLE_CLIENT_ID` | OAuth client ID (Google Cloud Console). |
| `GOOGLE_CLIENT_SECRET` | OAuth client secret (Google Cloud Console). |
| `GOOGLE_REFRESH_TOKEN` | Refresh token for the dedicated Google account. Get it with `npm run google:auth`. |
| `DATABASE_URL` | MongoDB Atlas connection string, including the database name (e.g. `.../invoices?retryWrites=true&w=majority`). |
| `MAX_FILE_SIZE_MB` | Maximum upload size in MB. Use `4` on Vercel's free plan (4.5 MB body limit). |
| `SESSION_SECRET` | Secret used to sign login sessions, at least 32 characters. Generate one with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`. |

Google credentials are only read on the server (`lib/drive.ts`) and are never sent to the browser.
Files are downloaded through `/api/invoices/[id]/file`, which proxies them from Drive.

## Users and login

Users are defined in `users.json` at the project root:

```json
[
  { "username": "admin", "password": "change-me" }
]
```

Add, remove or edit entries there and restart the server. **Change the default password before deploying.**

- Every page and the file download API require login (`proxy.ts`); logged-out visitors are sent to `/login`.
- A session lasts at most **2 hours** from login. After that the user has to log in again.
- Sessions are stored in a signed, HTTP-only cookie (`lib/session.ts`); nothing is stored server-side.
- Use the **Logout** button in the header to end the session early.

## 3. Google Drive setup

Files are uploaded as a **dedicated Google account** (e.g. a Gmail address created for this app) and use that account's Drive storage.

1. Sign in to the [Google Cloud Console](https://console.cloud.google.com/) with the dedicated account and create a project.
2. **Enable the Google Drive API**: APIs & Services → Library → "Google Drive API" → Enable.
3. **Configure the consent screen**: APIs & Services → OAuth consent screen (Google Auth Platform).
   - User type: **External**. Fill in the app name and your email.
   - Under **Audience**, click **Publish app** so the status is **In production**.
     In "Testing" status Google expires refresh tokens after 7 days and uploads would stop working.
     You do not need Google's verification for your own account.
4. **Create the OAuth client**: Credentials (Clients) → Create → OAuth client ID → Application type **Desktop app**.
   Copy the client ID and secret into `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.
5. **Set the folder ID**: open the invoices folder in the dedicated account's Drive and copy the last part of the URL
   (`https://drive.google.com/drive/folders/<FOLDER_ID>`) into `GOOGLE_DRIVE_FOLDER_ID`. Use the ID, not the folder name.
6. **Get the refresh token**:
   ```bash
   npm run google:auth
   ```
   Open the printed URL, sign in with the dedicated account and allow access. Google shows
   "Google hasn't verified this app" — click **Advanced → Go to (app name)**, since it's your own app.
   The terminal prints `GOOGLE_REFRESH_TOKEN=...` and checks that the folder is accessible. Paste that line into `.env`
   and restart the server.

The refresh token gives full access to the account's Drive, so keep `.env` private. It stays valid until you
revoke it (Google Account → Security → Third-party access) or change the account password.

## 4. Database setup

The app uses MongoDB through Prisma. [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) has a free (M0) cluster:

1. Sign up at https://www.mongodb.com/cloud/atlas and create a **free M0** cluster.
2. **Database Access** → add a database user with a username and password (avoid special characters like `@ : / ?` in the password, or URL-encode them).
3. **Network Access** → **Add IP Address** → **Allow access from anywhere** (`0.0.0.0/0`). Vercel has no fixed IP address, so this is required for hosting.
4. **Connect** → **Drivers** → copy the connection string and put it in `.env` as `DATABASE_URL`.
   Replace `<db_password>` with the password and add the database name before the `?`:

   ```env
   DATABASE_URL="mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/invoices?retryWrites=true&w=majority"
   ```

5. Create the collection and indexes:

```bash
npm run db:push
```

## 5. Running the application

Development:

```bash
npm run dev
```

Production:

```bash
npm run build
npm start
```

Open http://localhost:3000.

## 6. Free hosting (Vercel + MongoDB Atlas)

1. Push the project to a **private** GitHub repository (`.env` is git-ignored and is never pushed).
2. Sign up at https://vercel.com with GitHub → **Add New → Project** → import the repository.
3. Before clicking Deploy, open **Environment Variables** and add every variable from your `.env`
   (`NEXT_PUBLIC_APP_NAME`, all `GOOGLE_*`, `DATABASE_URL`, `MAX_FILE_SIZE_MB=4`, `SESSION_SECRET`).
4. Click **Deploy**. Your app is live at `https://<project>.vercel.app`.

After changing environment variables in Vercel, redeploy (Deployments → ⋯ → Redeploy).
The Google refresh token keeps working on Vercel; `npm run google:auth` only needs to run on your computer.

## Project structure

```
app/
  login/                              Login page, login/logout server actions
  (app)/layout.tsx, AppShell.tsx      Logged-in layout: header, menu, logout
  (app)/invoices/                     Invoice list + search
  (app)/invoices/new/                 Add Invoice form and server action (validate → upload to Drive → save)
  (app)/invoices/[id]/                Invoice details + preview
  api/invoices/[id]/file/route.ts     View (inline) / download (?download=1) the file from Drive
  Providers.tsx                       Ant Design registry and theme colors
lib/
  drive.ts                            Google Drive helper (server-only)
  auth.ts, session.ts                 Login check and signed session cookie
  db.ts                               Prisma client
  format.ts                           Formatting for display
proxy.ts                              Redirects logged-out users to /login
users.json                            Users (username + password)
prisma/schema.prisma                  Invoice model
```
