import { Router } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

const TOKEN_TTL = '12h';

function signToken(user) {
  return jwt.sign(
    { userId: user._id.toString(), username: user.username, role: user.role },
    process.env.JWT_SECRET || 'dev-secret',
    { expiresIn: TOKEN_TTL }
  );
}

// POST /api/auth/login  { username, password } -> { token, user }
router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required.' });
    }

    const user = await User.findOne({ username: String(username).trim().toLowerCase() });
    if (!user || !user.active) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    user.lastLoginAt = new Date();
    await user.save();

    res.json({ token: signToken(user), user: user.toJSON() });
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/me — returns the current user for the token
router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const user = await User.findById(req.auth.userId);
    if (!user || !user.active) return res.status(401).json({ error: 'Session expired.' });
    res.json({ user: user.toJSON() });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/change-password — any authed user updates their own password
router.post('/change-password', requireAuth, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body || {};
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new password are required.' });
    }
    if (String(newPassword).length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters.' });
    }

    const user = await User.findById(req.auth.userId);
    if (!user || !user.active) return res.status(401).json({ error: 'Session expired.' });

    const ok = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'Current password is incorrect.' });

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
