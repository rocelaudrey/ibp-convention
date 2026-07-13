import { useEffect, useMemo, useState } from 'react';
import { useAdminAuth } from '../hooks/useAdminAuth.js';
import { useAttendees } from '../hooks/useAttendees.js';
import { CATEGORY_LABELS } from '../config/event.js';
import { isApiMode } from '../services/api.js';
import { generateQRDataURL, buildQrPayload, downloadDataURL } from '../utils/qr.js';
import { generateCertificatePDF, generateBulkCertificatesPDF } from '../utils/certificate.js';
import { generateIdTagPDF, generateBulkIdTagsPDF } from '../utils/idTag.js';

import AdminLogin from '../components/admin/AdminLogin.jsx';
import AdminHeader from '../components/admin/AdminHeader.jsx';
import ServerRequired from '../components/admin/ServerRequired.jsx';
import StatsCards from '../components/admin/StatsCards.jsx';
import CheckInBar from '../components/admin/CheckInBar.jsx';
import FiltersBar from '../components/admin/FiltersBar.jsx';
import AttendeesTable from '../components/admin/AttendeesTable.jsx';
import AttendeeDetailModal from '../components/admin/AttendeeDetailModal.jsx';

export default function AdminPage() {
  const { isAuthed, user, isSuperAdmin, login, logout } = useAdminAuth();
  const { attendees, update, remove } = useAttendees({ enabled: isAuthed });

  const [search,  setSearch]  = useState('');
  const [chapter, setChapter] = useState('');
  const [status,  setStatus]  = useState('');
  const [openRef, setOpenRef] = useState(null);

  // Escape closes the detail modal
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') setOpenRef(null); }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  // NOTE: keep all hooks above the early-return branches below. React's
  // hook order must be stable across renders — moving a hook past a
  // conditional return trips error #310 in the production build.
  const chapters = useMemo(
    () => [...new Set(attendees.map(a => a.chapter).filter(Boolean))].sort(),
    [attendees]
  );

  const rows = useMemo(() => {
    let r = attendees;
    if (search) {
      const q = search.trim().toLowerCase();
      r = r.filter(a => {
        const hay = [a.fname, a.lname, a.mname, a.email, a.ref, a.rollnum, a.chapter, a.barAdmission]
          .filter(Boolean).join(' ').toLowerCase();
        return hay.includes(q);
      });
    }
    if (chapter)              r = r.filter(a => a.chapter === chapter);
    if (status === 'unpaid')   r = r.filter(a => !a.paid);
    if (status === 'paid')     r = r.filter(a => a.paid);
    if (status === 'checkedin')r = r.filter(a => a.checkedIn);
    if (status === 'cert')     r = r.filter(a => a.certificateIssued);
    return r;
  }, [attendees, search, chapter, status]);

  if (!isApiMode) return <ServerRequired />;
  if (!isAuthed) return <AdminLogin onLogin={login} />;

  const openAttendee = openRef ? attendees.find(a => a.ref === openRef) : null;

  // ─── actions ─────────────────────────────────────────────────
  async function togglePaid(ref) {
    const a = attendees.find(x => x.ref === ref);
    if (a) await update(ref, { paid: !a.paid });
  }
  async function toggleCheckIn(ref) {
    const a = attendees.find(x => x.ref === ref);
    if (!a) return;
    const checking = !a.checkedIn;
    await update(ref, { checkedIn: checking, checkedInAt: checking ? new Date().toISOString() : null });
  }
  async function deleteOne(ref) {
    const a = attendees.find(x => x.ref === ref);
    if (!a) return;
    if (!confirm(`Delete registration for ${a.fname} ${a.lname} (${ref})?\n\nThis cannot be undone.`)) return;
    await remove(ref);
    if (openRef === ref) setOpenRef(null);
  }
  async function issueCert(ref) {
    const a = attendees.find(x => x.ref === ref);
    if (!a) return;
    generateCertificatePDF(a);
    await update(ref, { certificateIssued: true, certificateIssuedAt: new Date().toISOString() });
  }
  async function downloadQR(ref) {
    const a = attendees.find(x => x.ref === ref);
    if (!a) return;
    const url = await generateQRDataURL(buildQrPayload(a), 320);
    downloadDataURL(url, `IBP-NL-QR-${a.ref}.png`);
  }

  async function printIdTag(ref) {
    const a = attendees.find(x => x.ref === ref);
    if (!a) return;
    await generateIdTagPDF(a);
  }

  async function exportCSV() {
    if (attendees.length === 0) { alert('No registrants to export.'); return; }
    const headers = [
      'Ref','First Name','Middle Name','Last Name','Birthday','Email','Phone',
      'Roll of Attorneys Number','Chapter','Bar Admission Year','Type',
      'Dietary','Registered At','Paid','Checked-In','Checked-In At',
      'Certificate Issued','Certificate Issued At'
    ];
    const esc = v => {
      if (v == null) return '';
      const s = String(v);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const rowsCsv = attendees.map(a => [
      a.ref, a.fname, a.mname, a.lname, a.birthday || '', a.email, a.phone,
      a.rollnum, a.chapter, a.barAdmission, CATEGORY_LABELS[a.category] || a.category,
      a.dietary, a.registeredAt, a.paid ? 'Yes' : 'No', a.checkedIn ? 'Yes' : 'No',
      a.checkedInAt || '', a.certificateIssued ? 'Yes' : 'No', a.certificateIssuedAt || ''
    ].map(esc).join(','));
    const csv = [headers.join(','), ...rowsCsv].join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ibp-nl-registrants-${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Bulk print name tags for whoever is currently filtered on-screen.
  async function bulkPrintTags() {
    if (rows.length === 0) { alert('No attendees in the current view.'); return; }
    const ok = confirm(`Generate ${rows.length} name tag${rows.length === 1 ? '' : 's'} into a single PDF?`);
    if (!ok) return;
    await generateBulkIdTagsPDF(rows);
  }

  // Bulk issue certificates: builds one multi-page PDF, then marks each
  // as certificateIssued = true (only the ones that weren't already).
  async function bulkIssueCerts() {
    if (rows.length === 0) { alert('No attendees in the current view.'); return; }
    const toMark = rows.filter(a => !a.certificateIssued);
    const alreadyIssued = rows.length - toMark.length;
    const summary = alreadyIssued
      ? `Generate ${rows.length} certificate${rows.length === 1 ? '' : 's'} into a single PDF and mark ${toMark.length} as issued? ${alreadyIssued} already marked issued and will be re-included in the PDF.`
      : `Generate ${rows.length} certificate${rows.length === 1 ? '' : 's'} into a single PDF and mark them as issued?`;
    if (!confirm(summary)) return;
    generateBulkCertificatesPDF(rows);
    const now = new Date().toISOString();
    for (const a of toMark) {
      await update(a.ref, { certificateIssued: true, certificateIssuedAt: now });
    }
  }

  return (
    <div className="admin-view">
      <AdminHeader user={user} isSuperAdmin={isSuperAdmin} onLogout={logout} />
      <StatsCards attendees={attendees} />
      <CheckInBar attendees={attendees} onCheckIn={toggleCheckIn} />
      <FiltersBar
        search={search}   setSearch={setSearch}
        chapter={chapter} setChapter={setChapter} chapters={chapters}
        status={status}   setStatus={setStatus}
        onExportCSV={exportCSV}
        onBulkPrintTags={bulkPrintTags}
        onBulkIssueCerts={bulkIssueCerts}
        bulkCount={rows.length}
      />
      <div className="admin-table-wrap">
        <div className="admin-table-card">
          <AttendeesTable
            attendees={rows}
            totalCount={attendees.length}
            onView={setOpenRef}
            onTogglePaid={togglePaid}
            onToggleCheckIn={toggleCheckIn}
            onIssueCert={issueCert}
            onDownloadQR={downloadQR}
            onPrintIdTag={printIdTag}
            onDelete={deleteOne}
          />
        </div>
      </div>

      {openAttendee && (
        <AttendeeDetailModal
          attendee={openAttendee}
          onClose={() => setOpenRef(null)}
          onTogglePaid={togglePaid}
          onToggleCheckIn={toggleCheckIn}
          onIssueCert={issueCert}
          onDownloadQR={downloadQR}
          onPrintIdTag={printIdTag}
          onDelete={deleteOne}
        />
      )}
    </div>
  );
}
