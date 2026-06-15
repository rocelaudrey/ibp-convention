export default function FiltersBar({
  search, setSearch,
  chapter, setChapter, chapters,
  status, setStatus,
  onExportCSV, onSeedDemo
}) {
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
        <option value="checkedin">Checked-In</option>
        <option value="cert">Certificate Issued</option>
      </select>
      <div className="filters-right">
        <button className="ghost" onClick={onExportCSV}>
          <i className="ti ti-download" aria-hidden="true"></i> Export CSV
        </button>
        <button className="ghost" onClick={onSeedDemo} title="Adds 3 sample attendees">
          <i className="ti ti-flask" aria-hidden="true"></i> Seed Demo
        </button>
      </div>
    </div>
  );
}
