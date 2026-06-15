import express from 'express';
import cors from 'cors';
import attendeesRouter from './routes/attendees.js';
import authRouter from './routes/auth.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

const origins = (process.env.CORS_ORIGINS || '')
  .split(',').map(s => s.trim()).filter(Boolean);

app.use(cors({
  origin: origins.length === 0 ? true : origins,
  credentials: false
}));

// Increase limit so base64 proof images fit.
app.use(express.json({ limit: '8mb' }));

app.get('/api/health', (req, res) => res.json({ ok: true, ts: Date.now() }));

app.use('/api/auth',      authRouter);
app.use('/api/attendees', attendeesRouter);

app.use(errorHandler);

export default app;
