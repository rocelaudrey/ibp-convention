import { CONVENTION_DAYS } from '../../config/event.js';

export default function FiltersBar({
  search, setSearch,
  chapter, setChapter, chapters,
  status, setStatus,
  onExportCSV,
  onBulkPrintTags,
  onBulkIssueCerts,
  onRecoverLegacy,
  bulkCount = 0,
}) {
  const bulkLabel = bulkCount > 0 ? ` (${bulkCount})` : '';
  return (
    <div className="admin-filters">
      <input
        type="text"
        placeholder="Search by name, email, ref, roll number..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <select value={chapter} onChange={(e) => setChapter(e.target.value)}>
        <option value="">All Chapters</option>
        {chapters.map(c => <option key={c} value={c}>{c}</option>)}
      </select>
      <select value={status} onChange={(e) => setStatus(e.target.value)}>
        <option value="">All Statuses</option>
        <option value="unpaid">Pending Payment</option>
        <option value="paid">Paid</option>
        <option value="checkedin">Checked-In (any day)</option>
        {CONVENTION_DAYS.map(d => (
          <option key={d.day} value={`checkedin:${d.day}`}>Checked-In · {d.label}</option>
        ))}
        {CONVENTION_DAYS.map(d => (
          <option key={`not-${d.day}`} value={`notcheckedin:${d.day}`}>Not Checked-In · {d.label}</option>
        ))}
        <option value="cert">Certificate Issued</option>
      </select>
      <div className="filters-right">
        <button className="ghost" onClick={onExportCSV}>
          <i className="ti ti-download" aria-hidden="true"></i> Export CSV
        </button>
        {onBulkPrintTags && (
          <button
            className="ghost"
            onClick={onBulkPrintTags}
            disabled={bulkCount === 0}
            title={bulkCount === 0 ? 'No attendees in the current view' : 'Prints one PDF with all filtered name tags'}
          >
            <i className="ti ti-id" aria-hidden="true"></i> Print name tags{bulkLabel}
          </button>
        )}
        {onBulkIssueCerts && (
          <button
            className="ghost"
            onClick={onBulkIssueCerts}
            disabled={bulkCount === 0}
            title={bulkCount === 0 ? 'No attendees in the current view' : 'Generates a PDF and marks each as certificate issued'}
          >
            <i className="ti ti-certificate" aria-hidden="true"></i> Issue certificates{bulkLabel}
          </button>
        )}
        {onRecoverLegacy && (
          <button
            className="ghost"
            onClick={onRecoverLegacy}
            title="One-time: import check-ins made before per-day logging (e.g. Day 1) into the per-day view"
          >
            <i className="ti ti-history" aria-hidden="true"></i> Recover Day 1
          </button>
        )}
      </div>
    </div>
  );
}
