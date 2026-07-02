# IBP North Luzon Regional Convention

Registration + admin portal for the IBP North Luzon Regional Convention.

## Structure

```
ibp-convention/
├── client/   # Vite + React frontend
└── server/   # Express + Mongoose backend (MongoDB Atlas-ready)
```

The client works in two modes controlled by `VITE_API_MODE`. In `local` mode the registration form uses `localStorage` (great for demoing the public form without a backend). The admin panel requires `api` mode — user accounts, sessions, and reports all live on the server.

## Quick start

### Registration form only (localStorage — no backend needed)

```bash
cd client
npm install
npm run dev
```

Open the printed URL (usually http://localhost:5173). The `/` page works fully; visiting `/admin` will show a "Server Required" screen because the admin panel needs the backend.

### Full stack (registration + admin)

```bash
# Terminal 1 — server
cd server
npm install
cp .env.example .env       # edit MONGODB_URI, JWT_SECRET, BOOTSTRAP_SUPER_*
npm run dev

# Terminal 2 — client
cd client
cp .env.example .env       # set VITE_API_MODE=api (VITE_API_URL can stay blank; Vite proxies /api → localhost:1337)
npm install
npm run dev
```

Sign in at `/admin` with the `BOOTSTRAP_SUPER_USERNAME` / `BOOTSTRAP_SUPER_PASSWORD` you set. The server seeds that user on first connect and no-ops thereafter.

## Deployment

Recommended stack: **Vercel** for the client + **Render** for the server + **MongoDB Atlas** for the database. Both hosts offer free tiers and free HTTPS (required for the check-in camera scanner). Auto-deploy on every push to `main`.

Deploy in this order — server first (client needs its URL), then client, then loop back to update CORS.

### 1. MongoDB Atlas

Already provisioned. On the Atlas dashboard, open **Network Access → IP Access List** and add `0.0.0.0/0` (Render's outbound IPs rotate, so allowlisting a single IP won't work). The connection is still protected by the DB user credentials in the URI.

### 2. Server — Render

- Push to GitHub, then on Render create a **New → Web Service** and pick this repo.
- **Root Directory**: `server`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Environment**: Node
- **Plan**: Free (fine for admin use; ~30s cold start after ~15 min idle)
- **Environment variables** (add under the service's Environment tab):

| Key | Value |
| --- | --- |
| `MONGODB_URI` | your Atlas connection string |
| `JWT_SECRET` | a fresh 64+ char random string |
| `BOOTSTRAP_SUPER_USERNAME` | e.g. `admin` |
| `BOOTSTRAP_SUPER_PASSWORD` | a strong new password (change on first login) |
| `CORS_ORIGINS` | leave blank for now; fill after the client is deployed |

Deploy. Once it's live, copy the URL (`https://<your-service>.onrender.com`).

### 3. Client — Vercel

- On Vercel create a **New Project** and pick this repo.
- **Root Directory**: `client`
- **Framework Preset**: Vite (auto-detected)
- **Environment variables**:

| Key | Value |
| --- | --- |
| `VITE_API_MODE` | `api` |
| `VITE_API_URL` | the Render URL from step 2 (no trailing slash) |

Deploy. Copy the Vercel URL (`https://<your-project>.vercel.app`).

The included [client/vercel.json](client/vercel.json) rewrites all paths to `index.html` so `/admin`, `/admin/users`, and `/admin/reports` survive a hard refresh.

### 4. Finish CORS

Back on Render → the server's Environment tab, set:

```
CORS_ORIGINS=https://<your-project>.vercel.app
```

Render will restart automatically. The client should now be able to log in.

### 5. First login

Go to `https://<your-project>.vercel.app/admin` and sign in with the bootstrap credentials from step 2. Open **Users** and create additional accounts, then delete the bootstrap credentials from Render's env vars so future restarts don't try to re-seed them.

## Features

- Registration with QR code generation (QR encodes `{ref, name}` for fast check-in)
- Auto-applied Senior Citizen / Lawyer-admitted-this-year discount; PWD rate with required ID upload
- Venue map + nearby hotels section
- Admin dashboard: stats, search, filters, CSV export, per-attendee detail modal with proof-of-payment and PWD ID previews
- Camera-based QR scanner for on-site check-in (requires HTTPS)
- Reports page: bar-anniversary awards (5/10/15+ years) and by-chapter breakdown with revenue math
- Multi-user admin with roles (super_admin, staff), bcrypt-hashed passwords, JWT sessions
- PDF certificate generation via jsPDF (landscape A4, signed-template)
