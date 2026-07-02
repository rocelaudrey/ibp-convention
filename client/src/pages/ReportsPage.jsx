import { useMemo, useState } from 'react';
import { useAdminAuth } from '../hooks/useAdminAuth.js';
import { useAttendees } from '../hooks/useAttendees.js';
import {
  BAR_MILESTONES,
  CATEGORY_FEE,
  CATEGORY_LABELS,
  REGISTRATION_TYPES,
  yearsSinceBar,
} from '../config/event.js';
import { isApiMode } from '../services/api.js';

import AdminHeader from '../components/admin/AdminHeader.jsx';
import AdminLogin from '../components/admin/AdminLogin.jsx';
import ServerRequired from '../components/admin/ServerRequired.jsx';

const PESO = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
  maximumFractionDigits: 0,
});

function csvEscape(v) {
  if (v == null) return '';
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function downloadCSV(filename, rows) {
  const csv = rows.map((r) => r.map(csvEscape).join(',')).join('\n');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function ReportsPage() {
  const { isAuthed, user, isSuperAdmin, login, logout } = useAdminAuth();
  const { attendees } = useAttendees();
  const [tab, setTab] = useState('anniversaries');

  // ── access gates ───────────────────────────────────────────
  if (!isApiMode) return <ServerRequired />;
  if (!isAuthed)  return <AdminLogin onLogin={login} />;

  return (
    <div className="admin-view">
      <AdminHeader user={user} isSuperAdmin={isSuperAdmin} onLogout={logout} />

      <main className="reports-main">
        <div className="reports-head">
          <div>
            <h2 className="reports-title">Reports</h2>
            <p className="reports-sub">Awards recognitions and regional breakdowns for the convention.</p>
          </div>
        </div>

        <div className="reports-tabs" role="tablist">
          <button
            role="tab"
            className={`reports-tab ${tab === 'anniversaries' ? 'active' : ''}`}
            onClick={() => setTab('anniversaries')}
          >
            <i className="ti ti-award" aria-hidden="true"></i> Bar Anniversaries
          </button>
          <button
            role="tab"
            className={`reports-tab ${tab === 'chapters' ? 'active' : ''}`}
            onClick={() => setTab('chapters')}
          >
            <i className="ti ti-map-2" aria-hidden="true"></i> By Chapter
          </button>
        </div>

        {tab === 'anniversaries' && <AnniversariesReport attendees={attendees} />}
        {tab === 'chapters'      && <ChapterReport      attendees={attendees} />}
      </main>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Bar anniversaries
// ─────────────────────────────────────────────────────────────
function AnniversariesReport({ attendees }) {
  const year = new Date().getFullYear();

  const groups = useMemo(() => {
    const buckets = BAR_MILESTONES.map((m) => ({ years: m, admittedIn: year - m, people: [] }));
    const missing = [];
    for (const a of attendees) {
      const y = yearsSinceBar(a.barAdmission);
      if (y == null) { missing.push(a); continue; }
      const bucket = buckets.find((b) => b.years === y);
      if (bucket) bucket.people.push(a);
    }
    for (const b of buckets) {
      b.people.sort((x, y2) => `${x.lname} ${x.fname}`.localeCompare(`${y2.lname} ${y2.fname}`));
    }
    return { buckets, missing };
  }, [attendees, year]);

  const totalHonorees = groups.buckets.reduce((n, b) => n + b.people.length, 0);

  function exportAllCSV() {
    const rows = [['Milestone (years)', 'Class of', 'Name', 'Chapter', 'Roll #']];
    for (const b of groups.buckets) {
      for (const p of b.people) {
        rows.push([
          b.years,
          b.admittedIn,
          [p.fname, p.mname, p.lname].filter(Boolean).join(' '),
          p.chapter || '',
          p.rollnum || '',
        ]);
      }
    }
    downloadCSV(`bar-anniversaries-${new Date().toISOString().slice(0, 10)}.csv`, rows);
  }

  function exportBucketCSV(b) {
    const rows = [
      [`${b.years} Years — Class of ${b.admittedIn}`],
      ['Name', 'Chapter', 'Roll #'],
    ];
    for (const p of b.people) {
      rows.push([
        [p.fname, p.mname, p.lname].filter(Boolean).join(' '),
        p.chapter || '',
        p.rollnum || '',
      ]);
    }
    downloadCSV(`bar-${b.years}yr-class-of-${b.admittedIn}.csv`, rows);
  }

  return (
    <section>
      <div className="reports-summary">
        <div><strong>{totalHonorees}</strong> honorees across <strong>{BAR_MILESTONES.length}</strong> milestone years</div>
        <div className="reports-actions">
          <button className="admin-btn primary" onClick={exportAllCSV} disabled={totalHonorees === 0}>
            <i className="ti ti-download" aria-hidden="true"></i> Export all
          </button>
          <button className="admin-btn" onClick={() => window.print()}>
            <i className="ti ti-printer" aria-hidden="true"></i> Print
          </button>
        </div>
      </div>

      <div className="milestone-grid">
        {groups.buckets.map((b) => (
          <article key={b.years} className={`milestone-card ${b.people.length === 0 ? 'empty' : ''}`}>
            <header className="milestone-head">
              <div>
                <div className="milestone-years">{b.years} <span>years</span></div>
                <div className="milestone-class">Class of {b.admittedIn}</div>
              </div>
              <div className="milestone-count">
                <span>{b.people.length}</span>
                <small>{b.people.length === 1 ? 'honoree' : 'honorees'}</small>
              </div>
            </header>

            {b.people.length === 0 ? (
              <div className="milestone-empty">No registrants in this milestone yet.</div>
            ) : (
              <>
                <ul className="milestone-list">
                  {b.people.map((p) => (
                    <li key={p.ref}>
                      <span className="mp-name">{[p.fname, p.mname, p.lname].filter(Boolean).join(' ')}</span>
                      <span className="mp-meta">{p.chapter || '—'}{p.rollnum ? ` · Roll ${p.rollnum}` : ''}</span>
                    </li>
                  ))}
                </ul>
                <button className="milestone-export" onClick={() => exportBucketCSV(b)}>
                  <i className="ti ti-download" aria-hidden="true"></i> Export this list
                </button>
              </>
            )}
          </article>
        ))}
      </div>

      {groups.missing.length > 0 && (
        <div className="reports-note">
          <i className="ti ti-info-circle" aria-hidden="true"></i>
          <span>
            {groups.missing.length} registrant{groups.missing.length === 1 ? '' : 's'} did not provide a bar-admission year and could not be placed in a milestone.
          </span>
        </div>
      )}
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// By chapter
// ─────────────────────────────────────────────────────────────
function ChapterReport({ attendees }) {
  const rows = useMemo(() => {
    const map = new Map();
    for (const a of attendees) {
      const key = a.chapter || 'Unspecified';
      if (!map.has(key)) {
        map.set(key, { chapter: key, total: 0, paid: 0, unpaid: 0, checkedIn: 0, collected: 0, expected: 0 });
      }
      const r = map.get(key);
      r.total += 1;
      if (a.paid) r.paid += 1; else r.unpaid += 1;
      if (a.checkedIn) r.checkedIn += 1;
      const fee = CATEGORY_FEE[a.category] || 0;
      r.expected += fee;
      if (a.paid) r.collected += fee;
    }
    return [...map.values()].sort((a, b) => b.total - a.total);
  }, [attendees]);

  const totals = useMemo(
    () => rows.reduce(
      (t, r) => ({
        total:     t.total     + r.total,
        paid:      t.paid      + r.paid,
        unpaid:    t.unpaid    + r.unpaid,
        checkedIn: t.checkedIn + r.checkedIn,
        collected: t.collected + r.collected,
        expected:  t.expected  + r.expected,
      }),
      { total: 0, paid: 0, unpaid: 0, checkedIn: 0, collected: 0, expected: 0 }
    ),
    [rows]
  );

  const perTier = useMemo(() => {
    const map = Object.fromEntries(REGISTRATION_TYPES.map((t) => [t.value, 0]));
    for (const a of attendees) if (map[a.category] != null) map[a.category] += 1;
    return REGISTRATION_TYPES.map((t) => ({ ...t, count: map[t.value] || 0 }));
  }, [attendees]);

  function exportCSV() {
    const header = ['Chapter', 'Total', 'Paid', 'Unpaid', 'Checked-In', 'Collected (₱)', 'Expected (₱)'];
    const body = rows.map((r) => [r.chapter, r.total, r.paid, r.unpaid, r.checkedIn, r.collected, r.expected]);
    const footer = ['TOTAL', totals.total, totals.paid, totals.unpaid, totals.checkedIn, totals.collected, totals.expected];
    downloadCSV(`by-chapter-${new Date().toISOString().slice(0, 10)}.csv`, [header, ...body, footer]);
  }

  return (
    <section>
      <div className="reports-summary">
        <div>
          <strong>{totals.total}</strong> registrants across <strong>{rows.length}</strong> chapters ·{' '}
          <strong>{PESO.format(totals.collected)}</strong> collected of <strong>{PESO.format(totals.expected)}</strong> expected
        </div>
        <div className="reports-actions">
          <button className="admin-btn primary" onClick={exportCSV} disabled={rows.length === 0}>
            <i className="ti ti-download" aria-hidden="true"></i> Export CSV
          </button>
          <button className="admin-btn" onClick={() => window.print()}>
            <i className="ti ti-printer" aria-hidden="true"></i> Print
          </button>
        </div>
      </div>

      <div className="tier-cards">
        {perTier.map((t) => (
          <div key={t.value} className="tier-card">
            <div className="tier-label">{t.label}</div>
            <div className="tier-count">{t.count}</div>
            <div className="tier-sub">{t.fee} each</div>
          </div>
        ))}
      </div>

      <div className="chapters-table-wrap">
        <table className="chapters-table">
          <thead>
            <tr>
              <th>Chapter</th>
              <th className="num">Total</th>
              <th className="num">Paid</th>
              <th className="num">Unpaid</th>
              <th className="num">Checked-In</th>
              <th className="num">Collected</th>
              <th className="num">Expected</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr><td colSpan="7" className="chapters-empty">No registrants yet.</td></tr>
            )}
            {rows.map((r) => (
              <tr key={r.chapter}>
                <td>{r.chapter}</td>
                <td className="num">{r.total}</td>
                <td className="num pos">{r.paid}</td>
                <td className="num neg">{r.unpaid}</td>
                <td className="num">{r.checkedIn}</td>
                <td className="num">{PESO.format(r.collected)}</td>
                <td className="num dim">{PESO.format(r.expected)}</td>
              </tr>
            ))}
          </tbody>
          {rows.length > 0 && (
            <tfoot>
              <tr>
                <td>Total</td>
                <td className="num">{totals.total}</td>
                <td className="num pos">{totals.paid}</td>
                <td className="num neg">{totals.unpaid}</td>
                <td className="num">{totals.checkedIn}</td>
                <td className="num">{PESO.format(totals.collected)}</td>
                <td className="num dim">{PESO.format(totals.expected)}</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </section>
  );
}
