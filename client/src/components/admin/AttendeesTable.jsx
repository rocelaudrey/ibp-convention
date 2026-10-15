import { CATEGORY_LABELS, CONVENTION_DAYS, currentConventionDay } from '../../config/event.js';

function fmtDate(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('en-PH', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  } catch { return '—'; }
}

function fullName(a) {
  return [a.fname, a.mname, a.lname].filter(Boolean).join(' ');
}

function StatusBadges({ a }) {
  const days = a.checkins || [];
  return (
    <>
      <span className={`badge ${a.paid ? 'paid' : 'unpaid'}`}>{a.paid ? 'Paid' : 'Unpaid'}</span>
      {' '}
      {CONVENTION_DAYS.length > 0 && (
        <span className="day-chips" title="Per-day check-in">
          {CONVENTION_DAYS.map(d => (
            <span
              key={d.day}
              className={`day-chip${days.some(c => c.day === d.day) ? ' on' : ''}`}
            >
              D{d.day}
            </span>
          ))}
        </span>
      )}
      {' '}
      {a.certificateIssued && <span className="badge cert">Cert</span>}
    </>
  );
}

export default function AttendeesTable({
  attendees, totalCount,
  onView, onTogglePaid, onToggleCheckIn, onIssueCert, onDownloadQR, onPrintIdTag, onDelete
}) {
  if (attendees.length === 0) {
    const isEmpty = totalCount === 0;
    return (
      <div className="empty-state">
        <i className="ti ti-database-off" aria-hidden="true"></i>
        <h4>{isEmpty ? 'No registrants yet' : 'No matches'}</h4>
        <p>
          {isEmpty
            ? 'Submissions from the registration form will show up here.'
            : 'No registrants match the current filters.'}
        </p>
      </div>
    );
  }

  const today = currentConventionDay();

  return (
    <div className="admin-table-scroll">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Ref #</th>
            <th>Name</th>
            <th>Chapter</th>
            <th>Type</th>
            <th>Registered</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {attendees.map(a => {
            const cat = CATEGORY_LABELS[a.category] || a.category || '—';
            const catCls = a.category || 'regular';
            const checkedToday = (a.checkins || []).some(c => c.day === today);
            return (
              <tr key={a.ref}>
                <td className="col-ref">{a.ref}</td>
                <td className="col-name">
                  {fullName(a)}
                  <div style={{ fontSize: '11.5px', color: '#8a6fb2', fontWeight: 400 }}>
                    {a.email || ''}
                  </div>
                </td>
                <td>{a.chapter || '—'}</td>
                <td><span className={`badge ${catCls}`}>{cat}</span></td>
                <td style={{ whiteSpace: 'nowrap', color: '#6b4d8e' }}>{fmtDate(a.registeredAt)}</td>
                <td><StatusBadges a={a} /></td>
                <td>
                  <div className="row-actions">
                    <button className="row-action-btn" title="View details"  onClick={() => onView(a.ref)}>
                      <i className="ti ti-eye"></i>
                    </button>
                    <button className="row-action-btn" title={a.paid ? 'Mark unpaid' : 'Mark paid'} onClick={() => onTogglePaid(a.ref)}>
                      <i className={`ti ti-${a.paid ? 'cash-off' : 'cash'}`}></i>
                    </button>
                    <button className="row-action-btn" title={checkedToday ? `Undo Day ${today} check-in` : `Check in for Day ${today}`} onClick={() => onToggleCheckIn(a.ref)}>
                      <i className={`ti ti-${checkedToday ? 'clipboard-x' : 'clipboard-check'}`}></i>
                    </button>
                    <button className="row-action-btn" title="Print ID name tag (3×4 in)" onClick={() => onPrintIdTag(a.ref)}>
                      <i className="ti ti-id-badge-2"></i>
                    </button>
                    <button className="row-action-btn" title="Generate certificate" onClick={() => onIssueCert(a.ref)}>
                      <i className="ti ti-certificate"></i>
                    </button>
                    <button className="row-action-btn" title="Download QR" onClick={() => onDownloadQR(a.ref)}>
                      <i className="ti ti-qrcode"></i>
                    </button>
                    <button className="row-action-btn danger" title="Delete" onClick={() => onDelete(a.ref)}>
                      <i className="ti ti-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
