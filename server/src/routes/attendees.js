import { Router } from 'express';
import { Attendee } from '../models/Attendee.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

// ─── Public: register ────────────────────────────────────────
// Anyone can POST a new registration.
router.post('/', async (req, res, next) => {
  try {
    const data = req.body || {};
    if (!data.ref) {
      data.ref = 'IBP-NL-' + Date.now().toString().slice(-7);
    }
    const attendee = await Attendee.create(data);
    res.status(201).json(attendee);
  } catch (err) {
    next(err);
  }
});

// ─── Admin: list ─────────────────────────────────────────────
router.get('/', requireAdmin, async (req, res, next) => {
  try {
    const list = await Attendee.find().sort({ registeredAt: -1 });
    res.json(list);
  } catch (err) {
    next(err);
  }
});

// ─── Admin: read one ─────────────────────────────────────────
router.get('/:ref', requireAdmin, async (req, res, next) => {
  try {
    const a = await Attendee.findOne({ ref: req.params.ref });
    if (!a) return res.status(404).json({ error: 'Not found' });
    res.json(a);
  } catch (err) {
    next(err);
  }
});

// ─── Admin: update ───────────────────────────────────────────
router.patch('/:ref', requireAdmin, async (req, res, next) => {
  try {
    const a = await Attendee.findOneAndUpdate(
      { ref: req.params.ref },
      req.body || {},
      { new: true, runValidators: true }
    );
    if (!a) return res.status(404).json({ error: 'Not found' });
    res.json(a);
  } catch (err) {
    next(err);
  }
});

// ─── Admin: delete ───────────────────────────────────────────
router.delete('/:ref', requireAdmin, async (req, res, next) => {
  try {
    const r = await Attendee.deleteOne({ ref: req.params.ref });
    if (r.deletedCount === 0) return res.status(404).json({ error: 'Not found' });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

export default router;
