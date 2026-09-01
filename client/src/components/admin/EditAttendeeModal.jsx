import { useState } from 'react';
import { createPortal } from 'react-dom';
import { CHAPTERS, REGISTRATION_TYPES } from '../../config/event.js';

// Fields the super_admin can edit. Kept in sync with the server's
// PROTECTED_FIELDS guard.
export default function EditAttendeeModal({ attendee, onClose, onSave }) {
  const chapterInList = CHAPTERS.includes(attendee.chapter);
  const [form, setForm] = useState({
    fname: attendee.fname || '',
    mname: attendee.mname || '',
    lname: attendee.lname || '',
    email: attendee.email || '',
    phone: attendee.phone || '',
    rollnum: attendee.rollnum || '',
    chapterSel: chapterInList ? attendee.chapter : (attendee.chapter ? 'Other' : ''),
    chapterOther: chapterInList ? '' : (attendee.chapter || ''),
    barAdmission: attendee.barAdmission || '',
    category: attendee.category || '',
    birthday: attendee.birthday || '',
    dietary: attendee.dietary || '',
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!form.fname.trim() || !form.lname.trim()) return setError('First and last name are required.');
    if (!form.rollnum.trim()) return setError('Roll of Attorneys Number is required.');
    const chapter = form.chapterSel === 'Other' ? form.chapterOther.trim() : form.chapterSel;
    if (!chapter) return setError('Please select or enter the IBP Chapter.');

    setBusy(true);
    try {
      await onSave(attendee.ref, {
        fname: form.fname.trim(),
        mname: form.mname.trim(),
        lname: form.lname.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        rollnum: form.rollnum.trim(),
        chapter,
        barAdmission: form.barAdmission.trim(),
        category: form.category,
        birthday: form.birthday,
        dietary: form.dietary.trim(),
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Save failed.');
    } finally {
      setBusy(false);
    }
  }

  return createPortal(
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }} role="dialog" aria-modal="true">
      <div className="modal-card user-modal edit-modal">
        <button className="modal-close-x" onClick={onClose} aria-label="Close">
          <i className="ti ti-x" aria-hidden="true"></i>
        </button>
        <h2 className="modal-title">Edit registrant</h2>
        <p className="modal-sub">{attendee.ref}</p>

        <form onSubmit={handleSubmit} className="user-form">
          <div className="edit-row3">
            <div className="field-group">
              <label>First name <span className="req">*</span></label>
              <input type="text" value={form.fname} onChange={(e) => set('fname', e.target.value)} />
            </div>
            <div className="field-group">
              <label>Middle name</label>
              <input type="text" value={form.mname} onChange={(e) => set('mname', e.target.value)} />
            </div>
            <div className="field-group">
              <label>Last name <span className="req">*</span></label>
              <input type="text" value={form.lname} onChange={(e) => set('lname', e.target.value)} />
            </div>
          </div>

          <div className="edit-row2">
            <div className="field-group">
              <label>Email</label>
              <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} />
            </div>
            <div className="field-group">
              <label>Contact number</label>
              <input type="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} />
            </div>
          </div>

          <div className="edit-row2">
            <div className="field-group">
              <label>Roll of Attorneys Number <span className="req">*</span></label>
              <input type="text" value={form.rollnum} onChange={(e) => set('rollnum', e.target.value)} />
            </div>
            <div className="field-group">
              <label>Year Admitted to the Bar</label>
              <input type="number" min="1940" max={new Date().getFullYear()} value={form.barAdmission} onChange={(e) => set('barAdmission', e.target.value)} />
            </div>
          </div>

          <div className="edit-row2">
            <div className="field-group">
              <label>IBP Chapter <span className="req">*</span></label>
              <select
                value={form.chapterSel}
                onChange={(e) => {
                  const v = e.target.value;
                  setForm((p) => ({ ...p, chapterSel: v, chapterOther: v === 'Other' ? p.chapterOther : '' }));
                }}
              >
                <option value="">— Select —</option>
                {CHAPTERS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="field-group">
              <label>Registration Type</label>
              <select value={form.category} onChange={(e) => set('category', e.target.value)}>
                <option value="">— Select —</option>
                {REGISTRATION_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label} — {t.fee}</option>)}
              </select>
            </div>
          </div>

          {form.chapterSel === 'Other' && (
            <div className="field-group">
              <label>Specify Chapter <span className="req">*</span></label>
              <input type="text" value={form.chapterOther} onChange={(e) => set('chapterOther', e.target.value)} placeholder="e.g. Pangasinan" />
            </div>
          )}

          <div className="edit-row2">
            <div className="field-group">
              <label>Date of Birth</label>
              <input type="date" max={new Date().toISOString().slice(0, 10)} value={form.birthday} onChange={(e) => set('birthday', e.target.value)} />
            </div>
            <div className="field-group">
              <label>Dietary / Special Needs</label>
              <input type="text" value={form.dietary} onChange={(e) => set('dietary', e.target.value)} />
            </div>
          </div>

          {error && <div className="modal-error">{error}</div>}

          <div className="modal-actions">
            <button type="button" className="admin-btn" onClick={onClose} disabled={busy}>Cancel</button>
            <button type="submit" className="admin-btn primary" disabled={busy}>
              <i className={`ti ${busy ? 'ti-loader-2' : 'ti-check'}`} aria-hidden="true"></i>
              {busy ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
