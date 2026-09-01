import { Router } from 'express';
import { Attendee } from '../models/Attendee.js';
import { requireAdmin } from '../middleware/auth.js';
import { sendPaymentConfirmation, mailerConfigured } from '../mailer.js';

const router = Router();

// ─── Public: register ────────────────────────────────────────
// Anyone can POST a new registration.
router.post('/', async (req, res, next) => {
  try {
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
      .select('-proofDataUrl -pwdIdDataUrl')
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
