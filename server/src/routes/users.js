import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { User, ROLES } from '../models/User.js';
import { requireSuperAdmin } from '../middleware/auth.js';

const router = Router();

// All routes here require super_admin.
router.use(requireSuperAdmin);

function normalizeUsername(v) {
  return String(v || '').trim().toLowerCase();
}

// GET /api/users
router.get('/', async (_req, res, next) => {
  try {
    const list = await User.find().sort({ createdAt: -1 });
    res.json(list.map((u) => u.toJSON()));
  } catch (err) {
    next(err);
  }
});

// POST /api/users  { username, name, password, role }
router.post('/', async (req, res, next) => {
  try {
    const username = normalizeUsername(req.body?.username);
    const name = String(req.body?.name || '').trim();
    const password = req.body?.password || '';
    const role = req.body?.role || 'staff';

    if (!username || username.length < 3) {
      return res.status(400).json({ error: 'Username must be at least 3 characters.' });
    }
    if (!ROLES.includes(role)) {
      return res.status(400).json({ error: `Role must be one of: ${ROLES.join(', ')}.` });
    }
    if (String(password).length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      name,
      passwordHash,
      role,
      active: true,
      createdBy: req.auth.userId,
    });
    res.status(201).json(user.toJSON());
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: 'Username already exists.' });
    }
    next(err);
  }
});

// PATCH /api/users/:id  — update name, role, active (not password, not username)
router.patch('/:id', async (req, res, next) => {
  try {
    const patch = {};
    if (typeof req.body?.name === 'string') patch.name = req.body.name.trim();
    if (req.body?.role) {
      if (!ROLES.includes(req.body.role)) {
        return res.status(400).json({ error: `Role must be one of: ${ROLES.join(', ')}.` });
      }
      patch.role = req.body.role;
    }
    if (typeof req.body?.active === 'boolean') patch.active = req.body.active;

    // Guard: don't let a super_admin demote/deactivate themselves and lock the panel.
    if (req.params.id === req.auth.userId) {
      if (patch.role && patch.role !== 'super_admin') {
        return res.status(400).json({ error: 'You cannot change your own role.' });
      }
      if (patch.active === false) {
        return res.status(400).json({ error: 'You cannot deactivate yourself.' });
      }
    }

    const user = await User.findByIdAndUpdate(req.params.id, patch, {
      new: true,
      runValidators: true,
    });
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json(user.toJSON());
  } catch (err) {
    next(err);
  }
});

// POST /api/users/:id/password  — super_admin resets any user's password
router.post('/:id/password', async (req, res, next) => {
  try {
    const password = req.body?.password || '';
    if (String(password).length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters.' });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { passwordHash },
      { new: true }
    );
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/users/:id
router.delete('/:id', async (req, res, next) => {
  try {
    if (req.params.id === req.auth.userId) {
      return res.status(400).json({ error: 'You cannot delete yourself.' });
    }
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'User not found.' });

    // Guard: never let the last super_admin get wiped out.
    if (deleted.role === 'super_admin') {
      const remaining = await User.countDocuments({ role: 'super_admin' });
      if (remaining === 0) {
        // Restore and refuse.
        await User.create(deleted.toObject());
        return res
          .status(400)
          .json({ error: 'Cannot delete the last super_admin account.' });
      }
    }
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
