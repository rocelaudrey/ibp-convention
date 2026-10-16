import { Router } from 'express';
import { Attendee } from '../models/Attendee.js';
import { requireAdmin, requireSuperAdmin } from '../middleware/auth.js';
import { sendPaymentConfirmation, mailerConfigured } from '../mailer.js';

const router = Router();

// Server-side registration gate. When true, new registrations are rejected
// regardless of the client (blocks cached/already-open forms that bypass the
// client-side maintenance screen). Flip to false to reopen.
const REGISTRATION_CLOSED = false;

// ─── Public: register ────────────────────────────────────────
// Anyone can POST a new registration (unless registration is closed).
router.post('/', async (req, res, next) => {
  try {
    if (REGISTRATION_CLOSED) {
      return res.status(503).json({ error: 'Registration is temporarily closed. Please try again later.' });
    }
    const data = req.body || {};
    const rollnum = String(data.rollnum || '').trim();

    // Idempotency guard: one Roll of Attorneys Number = one registration.
    // If it already exists, return that record instead of creating another.
    // Prevents the accidental double/triple submits that happen when the
    // form is slow (e.g. server cold start) and the registrant retries.
    if (rollnum) {
      const existing = await Attendee.findOne({ rollnum });
      if (existing) {
        return res.status(200).json({ ...existing.toJSON(), duplicate: true });
      }
    }

    // Email is required for new registrations (needed for the payment
    // confirmation). The schema stays optional so legacy records without an
    // email still load and can be updated by admins.
    const email = String(data.email || '').trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'A valid email address is required.' });
    }

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
// Excludes the heavy base64 image fields (proof of payment, PWD ID) so the
// table loads fast — a single proof image can be several MB. The full record,
// including images, is fetched per-attendee via GET /:ref when the detail
// modal opens.
router.get('/', requireAdmin, async (req, res, next) => {
  try {
    const list = await Attendee.find()
      .select('-proofDataUrl -pwdIdDataUrl -verifDocDataUrl')
      .sort({ registeredAt: -1 });
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

// Registration-detail fields. Editing any of these requires super_admin;
// operational fields (paid, checkedIn, certificate…) stay open to staff.
const PROTECTED_FIELDS = [
  'fname', 'mname', 'lname', 'email', 'phone', 'rollnum',
  'chapter', 'barAdmission', 'category', 'birthday', 'dietary',
  'promoCategory', 'govAgency',
];

// ─── Admin: update ───────────────────────────────────────────
router.patch('/:ref', requireAdmin, async (req, res, next) => {
  try {
    const body = req.body || {};
    const editsDetails = Object.keys(body).some((k) => PROTECTED_FIELDS.includes(k));
    if (editsDetails && req.auth.role !== 'super_admin') {
      return res.status(403).json({ error: 'Only a super admin can edit registration details.' });
    }

    const before = await Attendee.findOne({ ref: req.params.ref });
    if (!before) return res.status(404).json({ error: 'Not found' });

    const a = await Attendee.findOneAndUpdate(
      { ref: req.params.ref },
      req.body || {},
      { new: true, runValidators: true }
    );

    // Payment newly verified → send the confirmation email once, in the
    // background so a mail hiccup never blocks the admin action.
    const newlyPaid = a.paid && !before.paid;
    if (newlyPaid && a.email && !a.confirmationEmailSentAt && mailerConfigured()) {
      sendPaymentConfirmation(a)
        .then(() => Attendee.updateOne({ _id: a._id }, { confirmationEmailSentAt: new Date() }))
        .catch((err) => console.error('[mail] payment confirmation failed:', err.message));
    }

    res.json(a);
  } catch (err) {
    next(err);
  }
});

// ─── Admin: per-day check-in ─────────────────────────────────
// Records a check-in for a specific convention day (with timestamp). Idempotent
// per day — if already checked in that day, returns the existing record.
router.post('/:ref/checkin', requireAdmin, async (req, res, next) => {
  try {
    const day = Number(req.body?.day);
    if (!Number.isInteger(day) || day < 1) {
      return res.status(400).json({ error: 'A valid convention day is required.' });
    }
    const a = await Attendee.findOne({ ref: req.params.ref });
    if (!a) return res.status(404).json({ error: 'Not found' });

    const existing = (a.checkins || []).find((c) => c.day === day);
    if (existing) {
      return res.json({ ...a.toJSON(), alreadyCheckedIn: true, day, at: existing.at });
    }
    const at = new Date();
    a.checkins.push({ day, at });
    // Keep the legacy flag in sync (any day marks them generally checked-in).
    a.checkedIn = true;
    if (!a.checkedInAt) a.checkedInAt = at;
    await a.save();
    res.json({ ...a.toJSON(), day, at });
  } catch (err) {
    next(err);
  }
});

// Undo a check-in for a specific day (corrections).
router.post('/:ref/checkin/undo', requireAdmin, async (req, res, next) => {
  try {
    const day = Number(req.body?.day);
    const a = await Attendee.findOne({ ref: req.params.ref });
    if (!a) return res.status(404).json({ error: 'Not found' });
    a.checkins = (a.checkins || []).filter((c) => c.day !== day);
    a.checkedIn = a.checkins.length > 0;
    if (!a.checkedIn) a.checkedInAt = null;
    await a.save();
    res.json(a.toJSON());
  } catch (err) {
    next(err);
  }
});

// ─── Admin: recover legacy (pre-per-day) check-ins ───────────
// Before per-day check-in existed, a check-in was a single boolean
// (checkedIn + checkedInAt). Day 1 (Oct 15) was recorded that way. This
// one-time, super-admin-only backfill converts each legacy check-in into
// a dated per-day entry so it appears in the per-day views. Idempotent:
// it only adds an entry for a day that isn't already logged, so it is safe
// to run more than once.
const CONVENTION_DAY_DATES = [
  { day: 1, date: '2026-10-15' },
  { day: 2, date: '2026-10-16' },
  { day: 3, date: '2026-10-17' },
];
function conventionDayFor(at) {
  if (!at) return 1; // no timestamp → treat as Day 1 (the legacy single day)
  // Match on the Manila calendar date (check-ins happen in PH local time).
  const d = new Date(at).toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' });
  const match = CONVENTION_DAY_DATES.find((x) => x.date === d);
  return match ? match.day : 1; // outside the window → fall back to Day 1
}
router.post('/backfill-checkins', requireSuperAdmin, async (req, res, next) => {
  try {
    const legacy = await Attendee.find({ checkedIn: true });
    let migrated = 0;
    const byDay = {};
    for (const a of legacy) {
      const day = conventionDayFor(a.checkedInAt);
      if ((a.checkins || []).some((c) => c.day === day)) continue;
      a.checkins.push({ day, at: a.checkedInAt || new Date() });
      await a.save();
      migrated += 1;
      byDay[day] = (byDay[day] || 0) + 1;
    }
    res.json({ ok: true, scanned: legacy.length, migrated, byDay });
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
