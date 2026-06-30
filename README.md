# IBP North Luzon Regional Convention

Registration + admin portal for the IBP North Luzon Regional Convention.

## Structure

```
ibp-convention/
├── client/   # Vite + React frontend
└── server/   # Express + Mongoose backend (MongoDB Atlas-ready)
```

The client is fully functional on its own using `localStorage` as the data layer.
When the server is connected, swap `VITE_API_MODE=local` to `VITE_API_MODE=api` in
`client/.env` and the same UI talks to the REST backend instead.

## Quick start

### 1. Client only (localStorage mode — default)

```bash
cd client
npm install
npm run dev
```

Open the printed URL (usually http://localhost:5173).

- Registration page: `/`
- Admin portal: `/admin` (default password: `ibpadmin2026`)

### 2. With the backend

```bash
# Terminal 1
cd server
npm install
cp .env.example .env       # edit MONGODB_URI and ADMIN_PASSWORD
npm run dev

# Terminal 2
cd client
cp .env.example .env       # set VITE_API_MODE=api and VITE_API_URL
npm install
npm run dev
```

## Deployment

| Piece  | Suggested host                          | Notes                                        |
| ------ | --------------------------------------- | -------------------------------------------- |
| Client | Vercel / Netlify / Render Static        | `npm run build` → upload `client/dist/`      |
| Server | Render / Railway / Fly.io               | Set `MONGODB_URI`, `ADMIN_PASSWORD`, `PORT`  |
| DB     | MongoDB Atlas (free tier works for MVP) | Whitelist server IP, copy the connection URI |

Don't forget to set `VITE_API_URL` on the client build to your deployed server URL.

## Features

- Registration with QR code generation (QR encodes `{ref, name}` for fast check-in)
- Admin dashboard: stats, search, filters, CSV export
- Quick check-in by ref number (paste or scan)
- Per-attendee detail modal with proof-of-payment preview
- PDF certificate generation via jsPDF (landscape A4, signed-template)
- Password-gated admin route
