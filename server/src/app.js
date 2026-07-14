import express from 'express';
import cors from 'cors';
import attendeesRouter from './routes/attendees.js';
import authRouter from './routes/auth.js';
import usersRouter from './routes/users.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

// Allowed origins, normalized (trim + drop any trailing slash) so a value like
// "https://site.app/" still matches the browser's Origin "https://site.app".
const stripSlash = (s) => s.replace(/\/+$/, '');
const allowedOrigins = (process.env.CORS_ORIGINS || '')
  .split(',').map((s) => stripSlash(s.trim())).filter(Boolean);

app.use(cors({
  origin(origin, cb) {
    // No allowlist configured → allow all. Requests without an Origin header
    // (curl, health checks, server-to-server) are always allowed.
    if (allowedOrigins.length === 0 || !origin) return cb(null, true);
    cb(null, allowedOrigins.includes(stripSlash(origin)));
  },
  credentials: false,
}));

// Increase limit so base64 proof images fit.
app.use(express.json({ limit: '8mb' }));

app.get('/api/health', (req, res) => res.json({ ok: true, ts: Date.now() }));

app.use('/api/auth',      authRouter);
app.use('/api/attendees', attendeesRouter);
app.use('/api/users',     usersRouter);

app.use(errorHandler);

export default app;
