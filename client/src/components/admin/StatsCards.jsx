import { useMemo } from 'react';
import { CONVENTION_DAYS, currentConventionDay } from '../../config/event.js';

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
  const today = currentConventionDay();
  const todayLabel = CONVENTION_DAYS.find(d => d.day === today)?.label || `Day ${today}`;

  const stats = useMemo(() => ({
    total:       attendees.length,
    paid:        attendees.filter(a => a.paid).length,
    pending:     attendees.filter(a => !a.paid).length,
    checkedToday: attendees.filter(a => (a.checkins || []).some(c => c.day === today)).length
  }), [attendees, today]);

  return (
    <div className="admin-stats">
      <Card icon="ti-users"            label="Total Registrants"            value={stats.total} />
      <Card icon="ti-cash"             label="Paid"                         value={stats.paid}         tone="green" />
      <Card icon="ti-clock"            label="Pending Payment"              value={stats.pending}      tone="amber" />
      <Card icon="ti-clipboard-check"  label={`Checked-In · ${todayLabel}`} value={stats.checkedToday} tone="blue" />
    </div>
  );
}
