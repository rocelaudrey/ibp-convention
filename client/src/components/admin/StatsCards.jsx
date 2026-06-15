import { useMemo } from 'react';

function Card({ tone, icon, label, value }) {
  return (
    <div className={`stat-card${tone ? ' ' + tone : ''}`}>
      <div className="stat-icon"><i className={`ti ${icon}`} aria-hidden="true"></i></div>
      <div>
        <div className="stat-label">{label}</div>
        <div className="stat-value">{value}</div>
      </div>
    </div>
  );
}

export default function StatsCards({ attendees }) {
  const stats = useMemo(() => ({
    total:     attendees.length,
    paid:      attendees.filter(a => a.paid).length,
    pending:   attendees.filter(a => !a.paid).length,
    checkedIn: attendees.filter(a => a.checkedIn).length
  }), [attendees]);

  return (
    <div className="admin-stats">
      <Card icon="ti-users"            label="Total Registrants" value={stats.total} />
      <Card icon="ti-cash"             label="Paid"              value={stats.paid}      tone="green" />
      <Card icon="ti-clock"            label="Pending Payment"   value={stats.pending}   tone="amber" />
      <Card icon="ti-clipboard-check"  label="Checked-In"        value={stats.checkedIn} tone="blue" />
    </div>
  );
}
