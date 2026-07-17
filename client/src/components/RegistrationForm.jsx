import { useRef, useState } from 'react';
import {
  CHAPTERS, REGISTRATION_TYPES,
  isSeniorByBirthday, ageThisYear, SENIOR_AGE,
  isNewLawyerByBarYear,
  isEarlyBirdOpen, EARLYBIRD_WINDOW,
} from '../config/event.js';
import * as api from '../services/api.js';
import { generateQRDataURL, buildQrPayload } from '../utils/qr.js';
import PaymentBox from './PaymentBox.jsx';
import UploadZone from './UploadZone.jsx';
import SuccessModal from './SuccessModal.jsx';

const EMPTY = {
  fname: '', lname: '', mname: '',
  birthday: '',
  email: '', phone: '',
  rollnum: '', chapter: '', chapterOther: '', barAdmission: '', category: '',
  dietary: ''
};

// Today as YYYY-MM-DD, used to reject future birthdates.
const TODAY_ISO = new Date().toISOString().slice(0, 10);

// Date-of-birth dropdown options. The three fields are assembled into a
// single YYYY-MM-DD `birthday` string, so nothing downstream changes.
const DOB_MONTHS = [
  ['01', 'January'], ['02', 'February'], ['03', 'March'], ['04', 'April'],
  ['05', 'May'], ['06', 'June'], ['07', 'July'], ['08', 'August'],
  ['09', 'September'], ['10', 'October'], ['11', 'November'], ['12', 'December'],
];
const DOB_DAYS = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'));
const DOB_CURRENT_YEAR = new Date().getFullYear();
const DOB_YEARS = Array.from({ length: DOB_CURRENT_YEAR - 1925 + 1 }, (_, i) => String(DOB_CURRENT_YEAR - i));

// True only for a real calendar date (rejects e.g. Feb 30, which JS would
// otherwise roll over into March).
function isRealDate(iso) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return false;
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d;
}

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function isValidEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

export default function RegistrationForm() {
  const [form, setForm]       = useState(EMPTY);
  const [proof, setProof]     = useState(null);
  const [pwdId, setPwdId]     = useState(null);
  const [agree, setAgree]     = useState(false);
  const [error, setError]     = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);   // { attendee, qrDataUrl } | null
  // Synchronous lock so rapid double-clicks can't both fire before React
  // re-renders the disabled button. The server also dedupes on roll number.
  const submitLock = useRef(false);

  // Date-of-birth parts live in local state (never sent to the DB); they are
  // composed into form.birthday only when all three are chosen.
  const [bMonth, setBMonth] = useState('');
  const [bDay,   setBDay]   = useState('');
  const [bYear,  setBYear]  = useState('');

  function updateBirthday(part, value) {
    const parts = {
      month: part === 'month' ? value : bMonth,
      day:   part === 'day'   ? value : bDay,
      year:  part === 'year'  ? value : bYear,
    };
    if (part === 'month') setBMonth(value);
    if (part === 'day')   setBDay(value);
    if (part === 'year')  setBYear(value);

    const iso = (parts.year && parts.month && parts.day)
      ? `${parts.year}-${parts.month}-${parts.day}`
      : '';
    setForm(prev => {
      const next = { ...prev, birthday: iso };
      // Auto-apply the Senior rate once a complete birthdate is chosen.
      if (iso && isSeniorByBirthday(iso) && prev.category !== 'senior') {
        next.category = 'senior';
      }
      return next;
    });
  }

  function update(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  // New-lawyer auto-detect runs on blur of the bar-year field so a partial
  // year while typing doesn't briefly flip the category. (Senior is handled
  // in updateBirthday, since the date dropdowns are always complete values.)
  function autoApplyDiscountsFromBarYear() {
    if (
      isNewLawyerByBarYear(form.barAdmission) &&
      !isSeniorByBirthday(form.birthday) &&
      form.category !== 'newlawyer'
    ) {
      setForm(prev => ({ ...prev, category: 'newlawyer' }));
    }
  }

  const senior       = isSeniorByBirthday(form.birthday);
  const newLawyer    = isNewLawyerByBarYear(form.barAdmission);
  const age          = ageThisYear(form.birthday);
  const earlyBirdOpen = isEarlyBirdOpen();

  async function handleSubmit(e) {
    e.preventDefault();
    if (submitLock.current) return;   // ignore rapid repeat clicks
    setError('');

    const { fname, lname, birthday, email, phone, rollnum, chapter, chapterOther, category } = form;
    if (!fname.trim() || !lname.trim())  return setError('Please enter your full name (first and last name are required).');
    if (!birthday)                       return setError('Please complete your date of birth (month, day, and year).');
    if (!isRealDate(birthday))           return setError('Please enter a valid date of birth.');
    if (birthday > TODAY_ISO)            return setError('Date of birth cannot be in the future.');
    if (!email.trim())                   return setError('Please enter your email address.');
    if (!isValidEmail(email))            return setError('Please enter a valid email address (e.g. name@example.com).');
    if (!phone.trim())                   return setError('Please enter your contact number.');
    if (!rollnum.trim())                 return setError('Please enter your Roll of Attorneys Number.');
    if (!chapter)                        return setError('Please select your IBP Chapter.');
    if (chapter === 'Other' && !chapterOther.trim())
      return setError('Please enter your IBP Chapter name.');
    if (!category)                       return setError('Please select your registration type.');
    if (category === 'earlybird' && !earlyBirdOpen)
      return setError(`The Early Bird promo is only available ${EARLYBIRD_WINDOW.label}. Please choose another registration type.`);
    if (category === 'pwd' && !pwdId)    return setError('Please upload a copy of your PWD ID to qualify for the PWD rate.');
    if (!proof)                          return setError('Please upload your proof of payment before submitting.');
    if (!agree)                          return setError('Please agree to the terms and conditions to proceed.');

    const finalChapter = chapter === 'Other' ? chapterOther.trim() : chapter;

    submitLock.current = true;
    setSubmitting(true);
    try {
      let proofDataUrl = null;
      try { proofDataUrl = await readFileAsDataURL(proof); }
      catch { /* ignore — registration still proceeds */ }

      let pwdIdDataUrl = null;
      if (pwdId) {
        try { pwdIdDataUrl = await readFileAsDataURL(pwdId); }
        catch { /* ignore — registration still proceeds */ }
      }

      const ref = 'IBP-NL-' + Date.now().toString().slice(-7);
      const { chapterOther: _drop, ...rest } = form;
      const attendee = await api.createAttendee({
        ref,
        ...rest,
        chapter:      finalChapter,
        proofName:    proof.name,
        proofType:    proof.type || '',
        proofDataUrl,
        pwdIdName:    pwdId?.name || '',
        pwdIdType:    pwdId?.type || '',
        pwdIdDataUrl,
      });

      const qrDataUrl = await generateQRDataURL(buildQrPayload(attendee), 256);
      // `duplicate` means the server found an existing registration for this
      // roll number and returned it instead of creating a new row.
      setSuccess({ attendee, qrDataUrl, duplicate: !!attendee.duplicate });
    } catch (err) {
      setError(err.message || 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
      submitLock.current = false;
    }
  }

  function handleSuccessClose() {
    setSuccess(null);
    setForm(EMPTY);
    setBMonth(''); setBDay(''); setBYear('');
    setProof(null);
    setPwdId(null);
    setAgree(false);
    setError('');
  }

  return (
    <>
      <form className="form-card" onSubmit={handleSubmit} noValidate>

        <div className="mcle-notice">
          <i className="ti ti-certificate" aria-hidden="true"></i>
          <div>
            <div className="mcle-heading">Inclusive of 6 MCLE Credit Units</div>
            <div className="mcle-sub">Awarded from selected lectures or topics during the convention.</div>
          </div>
        </div>

        {/* PERSONAL */}
        <div className="section-gap">
          <div className="section-label">
            <i className="ti ti-user" aria-hidden="true"></i>
            Personal Information
          </div>
          <div className="fields-grid">
            <div className="field-group">
              <label htmlFor="fname">First Name <span className="req">*</span></label>
              <input id="fname" type="text" value={form.fname} onChange={e => update('fname', e.target.value)} placeholder="e.g. Juan" autoComplete="given-name" />
            </div>
            <div className="field-group">
              <label htmlFor="lname">Last Name <span className="req">*</span></label>
              <input id="lname" type="text" value={form.lname} onChange={e => update('lname', e.target.value)} placeholder="e.g. dela Cruz" autoComplete="family-name" />
            </div>
            <div className="field-group field-full">
              <label htmlFor="mname">Middle Name</label>
              <input id="mname" type="text" value={form.mname} onChange={e => update('mname', e.target.value)} placeholder="Optional" autoComplete="additional-name" />
            </div>
            <div className="field-group field-full">
              <label htmlFor="dob-month">Date of Birth <span className="req">*</span></label>
              <div className="dob-fields">
                <select
                  id="dob-month"
                  aria-label="Birth month"
                  value={bMonth}
                  onChange={e => updateBirthday('month', e.target.value)}
                >
                  <option value="">Month</option>
                  {DOB_MONTHS.map(([v, label]) => <option key={v} value={v}>{label}</option>)}
                </select>
                <select
                  aria-label="Birth day"
                  value={bDay}
                  onChange={e => updateBirthday('day', e.target.value)}
                >
                  <option value="">Day</option>
                  {DOB_DAYS.map(d => <option key={d} value={d}>{Number(d)}</option>)}
                </select>
                <select
                  aria-label="Birth year"
                  value={bYear}
                  onChange={e => updateBirthday('year', e.target.value)}
                >
                  <option value="">Year</option>
                  {DOB_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              {age != null && age >= 0 && (
                <small style={{ fontSize: 11.5, color: senior ? '#166534' : '#8a6fb2', marginTop: 2 }}>
                  {senior
                    ? `✓ Turns ${age} this year — Senior Citizen rate will apply.`
                    : `Turns ${age} this year.`}
                </small>
              )}
            </div>
            <div className="field-group">
              <label htmlFor="email">Email Address <span className="req">*</span></label>
              <input id="email" type="email" value={form.email} onChange={e => update('email', e.target.value)} placeholder="you@example.com" autoComplete="email" />
            </div>
            <div className="field-group">
              <label htmlFor="phone">Contact Number <span className="req">*</span></label>
              <input id="phone" type="tel" value={form.phone} onChange={e => update('phone', e.target.value)} placeholder="+63 9XX XXX XXXX" autoComplete="tel" />
            </div>
          </div>
        </div>

        {/* PROFESSIONAL */}
        <div className="section-gap">
          <div className="section-label">
            <i className="ti ti-building" aria-hidden="true"></i>
            Professional Details
          </div>
          <div className="fields-grid">
            <div className="field-group field-full">
              <label htmlFor="rollnum">Roll of Attorneys Number <span className="req">*</span></label>
              <input id="rollnum" type="text" value={form.rollnum} onChange={e => update('rollnum', e.target.value)} placeholder="e.g. 12345" />
            </div>
            <div className="field-group field-full">
              <label htmlFor="chapter">IBP Chapter <span className="req">*</span></label>
              <select
                id="chapter"
                value={form.chapter}
                onChange={e => {
                  const v = e.target.value;
                  setForm(prev => ({
                    ...prev,
                    chapter: v,
                    chapterOther: v === 'Other' ? prev.chapterOther : '',
                  }));
                }}
              >
                <option value="">— Select your Chapter —</option>
                {CHAPTERS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            {form.chapter === 'Other' && (
              <div className="field-group field-full">
                <label htmlFor="chapterOther">Specify Chapter <span className="req">*</span></label>
                <input
                  id="chapterOther"
                  type="text"
                  value={form.chapterOther}
                  onChange={e => update('chapterOther', e.target.value)}
                  placeholder="e.g. Pangasinan"
                />
              </div>
            )}
            <div className="field-group field-full">
              <label htmlFor="barAdmission">Year Admitted to the Bar</label>
              <input
                id="barAdmission"
                type="number"
                min="1940"
                max={new Date().getFullYear()}
                value={form.barAdmission}
                onChange={e => update('barAdmission', e.target.value)}
                onBlur={autoApplyDiscountsFromBarYear}
                placeholder="e.g. 2015"
              />
            </div>
            <div className="field-group field-full">
              <label htmlFor="category">Registration Type <span className="req">*</span></label>
              <select id="category" value={form.category} onChange={e => update('category', e.target.value)}>
                <option value="">— Select registration type —</option>
                {REGISTRATION_TYPES.map(t => {
                  const ebClosed = t.value === 'earlybird' && !earlyBirdOpen;
                  return (
                    <option key={t.value} value={t.value} disabled={ebClosed}>
                      {t.label} — {t.fee}{ebClosed ? ' (promo ended)' : ''}
                    </option>
                  );
                })}
              </select>
              {!earlyBirdOpen && (
                <small style={{ fontSize: 11.5, color: '#b45309', marginTop: 2 }}>
                  The Early Bird promo ({EARLYBIRD_WINDOW.label}) has ended.
                </small>
              )}
              {senior && form.category === 'senior' && (
                <small style={{ fontSize: 11.5, color: '#166534', marginTop: 2 }}>
                  Senior Citizen discount auto-applied (age {SENIOR_AGE}+ this year).
                </small>
              )}
              {senior && form.category && form.category !== 'senior' && (
                <small style={{ fontSize: 11.5, color: '#b45309', marginTop: 2 }}>
                  You qualify for the Senior Citizen rate. Switch back if this was unintentional.
                </small>
              )}
              {!senior && newLawyer && form.category === 'newlawyer' && (
                <small style={{ fontSize: 11.5, color: '#166534', marginTop: 2 }}>
                  New Lawyer discount auto-applied (admitted to the bar this year).
                </small>
              )}
              {!senior && newLawyer && form.category && form.category !== 'newlawyer' && (
                <small style={{ fontSize: 11.5, color: '#b45309', marginTop: 2 }}>
                  You qualify for the New Lawyer rate. Switch back if this was unintentional.
                </small>
              )}
              {form.category === 'pwd' && (
                <small style={{ fontSize: 11.5, color: '#6b5080', marginTop: 2 }}>
                  A copy of your PWD ID is required to qualify for this rate — please upload it below.
                </small>
              )}
            </div>
            {form.category === 'pwd' && (
              <div className="field-group field-full">
                <label>PWD ID <span className="req">*</span></label>
                <UploadZone
                  file={pwdId}
                  onFile={(f, err) => { setPwdId(f); if (err) setError(err); }}
                  onClear={() => setPwdId(null)}
                />
              </div>
            )}
            <div className="field-group field-full">
              <label htmlFor="dietary">Dietary Requirements / Special Needs</label>
              <textarea id="dietary" value={form.dietary} onChange={e => update('dietary', e.target.value)} placeholder="e.g. vegetarian, halal, wheelchair access, etc. Leave blank if none."></textarea>
            </div>
          </div>
        </div>

        {/* PAYMENT */}
        <div className="section-gap">
          <div className="section-label">
            <i className="ti ti-credit-card" aria-hidden="true"></i>
            Registration Fee &amp; Payment
          </div>
          <PaymentBox />

          <div className="section-label" style={{ marginTop: '0.25rem' }}>
            <i className="ti ti-upload" aria-hidden="true"></i>
            Upload Proof of Payment
          </div>
          <UploadZone
            file={proof}
            onFile={(f, err) => { setProof(f); if (err) setError(err); }}
            onClear={() => setProof(null)}
          />
        </div>

        {/* AGREE + SUBMIT */}
        <div className="agree-row">
          <input id="agree" type="checkbox" checked={agree} onChange={e => setAgree(e.target.checked)} />
          <label htmlFor="agree">
            I certify that all information provided is accurate and complete. I agree to the
            {' '}<a href="#">terms and conditions</a> of the IBP Northern Luzon Regional Convention.
          </label>
        </div>

        <button className="submit-btn" type="submit" disabled={submitting}>
          <i className={`ti ${submitting ? 'ti-loader-2' : 'ti-send'}`} aria-hidden="true"></i>
          {submitting ? 'Saving...' : 'Submit Registration'}
        </button>

        {error && (
          <div className="error-msg">
            <i className="ti ti-alert-circle" aria-hidden="true"></i>
            <span>{error}</span>
          </div>
        )}
      </form>

      {success && (
        <SuccessModal
          attendee={success.attendee}
          qrDataUrl={success.qrDataUrl}
          duplicate={success.duplicate}
          onClose={handleSuccessClose}
        />
      )}
    </>
  );
}
