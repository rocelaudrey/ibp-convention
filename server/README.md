# IBP Convention Server

Express + Mongoose REST API for the registration/admin app.

## Setup

```bash
npm install
cp .env.example .env   # then edit MONGODB_URI + ADMIN_PASSWORD + JWT_SECRET
npm run dev            # auto-reloads on save (Node 20+)
# or
npm start
```

## Endpoints

| Method | Path                       | Auth     | Purpose                       |
|--------|----------------------------|----------|-------------------------------|
| GET    | `/api/health`              | —        | Liveness check                |
| POST   | `/api/auth/login`          | —        | `{password}` → `{token}`      |
| POST   | `/api/attendees`           | —        | Public: register an attendee  |
| GET    | `/api/attendees`           | Admin    | List all attendees            |
| GET    | `/api/attendees/:ref`      | Admin    | Read one                      |
| PATCH  | `/api/attendees/:ref`      | Admin    | Partial update                |
| DELETE | `/api/attendees/:ref`      | Admin    | Delete                        |

Admin endpoints expect `Authorization: Bearer <token>` from `/api/auth/login`.
Tokens are JWTs signed with `JWT_SECRET`, valid for 12 hours.

## Notes for production

- **Proof of payment**: this MVP stores the file as a base64 dataURL inside the
  attendee document. MongoDB's 16 MB document limit means this is fine for small
  events but won't scale. Swap to S3, Cloudinary, or GridFS and store a URL
  instead — only `models/Attendee.js` and the create route need changes.
- **Rate limiting**: add `express-rate-limit` on `/api/auth/login` before going live.
- **HTTPS**: terminate TLS at your hosting platform (Render, Fly.io, Nginx, etc.).
- **MongoDB Atlas IP allowlist**: whitelist your server's egress IP, or set
  `0.0.0.0/0` for quick start (less secure).
