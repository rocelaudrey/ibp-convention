import { CATEGORY_LABELS, ageThisYear } from '../../config/event.js';

function fmt(iso) {
  if (!iso) return '—';
  try { return new Date(iso).toLocaleString('en-PH'); }
  catch { return '—'; }
}

function fmtDate(yyyyMmDd) {
  if (!yyyyMmDd) return '—';
  const d = new Date(yyyyMmDd);
  if (isNaN(d.getTime())) return yyyyMmDd;
  return d.toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function AttendeeDetailModal({
  attendee,
  onClose,
  onTogglePaid, onToggleCheckIn, onIssueCert, onDownloadQR, onPrintIdTag, onDelete
}) {
  if (!attendee) return null;
  const a = attendee;
  const fullName = [a.fname, a.mname, a.lname].filter(Boolean).join(' ');
  const initials = (a.fname?.[0] || '') + (a.lname?.[0] || '');

  const statusBits = [];
  statusBits.push(a.paid ? 'Paid' : 'Unpaid');
  if (a.checkedIn)         statusBits.push(`Checked-in${a.checkedInAt ? ' (' + fmt(a.checkedInAt) + ')' : ''}`);
  if (a.certificateIssued) statusBits.push('Certificate issued');

  const proofIsImage = (a.proofType || '').startsWith('image/');
  const pwdIsImage   = (a.pwdIdType || '').startsWith('image/');
  const hasPwdId     = a.category === 'pwd' || a.pwdIdName || a.pwdIdDataUrl;

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }} role="dialog" aria-modal="true">
      <div className="modal-card wide">
        <button className="modal-close-x" onClick={onClose} aria-label="Close">
          <i className="ti ti-x" aria-hidden="true"></i>
        </button>

        <div className="detail-header">
          <div className="detail-avatar">{initials || '—'}</div>
          <div>
            <div className="dh-name">{fullName}</div>
            <div className="dh-ref">{a.ref}</div>
          </div>
        </div>

        <div className="detail-grid">
          <div className="dg-item"><div className="dg-label">Email</div><div className="dg-value">{a.email || '—'}</div></div>
          <div className="dg-item"><div className="dg-label">Phone</div><div className="dg-value">{a.phone || '—'}</div></div>
          <div className="dg-item">
            <div className="dg-label">Date of Birth</div>
            <div className="dg-value">
              {fmtDate(a.birthday)}
              {a.birthday && ageThisYear(a.birthday) != null && (
                <span style={{ color: '#8a6fb2', fontSize: 11.5 }}>
                  {' '}· turns {ageThisYear(a.birthday)} this year
                </span>
              )}
            </div>
          </div>
          <div className="dg-item"><div className="dg-label">Roll of Attorneys Number</div><div className="dg-value">{a.rollnum || '—'}</div></div>
          <div className="dg-item"><div className="dg-label">Chapter</div><div className="dg-value">{a.chapter || '—'}</div></div>
          <div className="dg-item"><div className="dg-label">Registration Type</div><div className="dg-value">{CATEGORY_LABELS[a.category] || a.category || '—'}</div></div>
          <div className="dg-item"><div className="dg-label">Year Admitted to the Bar</div><div className="dg-value">{a.barAdmission || '—'}</div></div>
          <div className="dg-item dg-full"><div className="dg-label">Dietary / Special Needs</div><div className="dg-value">{a.dietary || 'None'}</div></div>
          <div className="dg-item"><div className="dg-label">Registered</div><div className="dg-value">{fmt(a.registeredAt)}</div></div>
          <div className="dg-item"><div className="dg-label">Status</div><div className="dg-value">{statusBits.join(' · ')}</div></div>
        </div>

        <div className="detail-proof">
          <div className="proof-name">
            {a.proofDataUrl
              ? (a.proofName || 'Proof of payment')
              : (a.proofName ? `${a.proofName} (file not stored)` : 'No proof uploaded')}
          </div>
          {a.proofDataUrl && proofIsImage && <img src={a.proofDataUrl} alt="Proof of payment" />}
          {a.proofDataUrl && (
            <div>
              <a href={a.proofDataUrl} download={a.proofName || 'proof-of-payment'}>Download attached file</a>
            </div>
          )}
        </div>

        {hasPwdId && (
          <div className="detail-proof">
            <div className="proof-name">
              PWD ID —{' '}
              {a.pwdIdDataUrl
                ? (a.pwdIdName || 'uploaded')
                : (a.pwdIdName ? `${a.pwdIdName} (file not stored)` : 'not uploaded')}
            </div>
            {a.pwdIdDataUrl && pwdIsImage && <img src={a.pwdIdDataUrl} alt="PWD ID" />}
            {a.pwdIdDataUrl && (
              <div>
                <a href={a.pwdIdDataUrl} download={a.pwdIdName || 'pwd-id'}>Download attached file</a>
              </div>
            )}
          </div>
        )}

        <div className="detail-actions">
          <button className="ghost" onClick={() => onTogglePaid(a.ref)}>
            <i className={`ti ti-${a.paid ? 'cash-off' : 'cash'}`} aria-hidden="true"></i>
            {a.paid ? ' Mark Unpaid' : ' Mark Paid'}
          </button>
          <button className="ghost" onClick={() => onToggleCheckIn(a.ref)}>
            <i className={`ti ti-${a.checkedIn ? 'clipboard-x' : 'clipboard-check'}`} aria-hidden="true"></i>
            {a.checkedIn ? ' Undo Check-in' : ' Check In'}
          </button>
          <button onClick={() => onPrintIdTag(a.ref)}>
            <i className="ti ti-id-badge-2" aria-hidden="true"></i> Print ID Tag (3×4 in)
          </button>
          <button onClick={() => onIssueCert(a.ref)}>
            <i className="ti ti-certificate" aria-hidden="true"></i> Generate Certificate
          </button>
          <button className="ghost" onClick={() => onDownloadQR(a.ref)}>
            <i className="ti ti-qrcode" aria-hidden="true"></i> Download QR
          </button>
          <button className="danger" onClick={() => onDelete(a.ref)}>
            <i className="ti ti-trash" aria-hidden="true"></i> Delete
          </button>
        </div>
      </div>
    </div>
  );
}
