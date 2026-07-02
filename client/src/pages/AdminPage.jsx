import { useEffect, useMemo, useState } from 'react';
import { useAdminAuth } from '../hooks/useAdminAuth.js';
import { useAttendees } from '../hooks/useAttendees.js';
import { CATEGORY_LABELS } from '../config/event.js';
import { isApiMode } from '../services/api.js';
import { generateQRDataURL, buildQrPayload, downloadDataURL } from '../utils/qr.js';
import { generateCertificatePDF } from '../utils/certificate.js';
import { generateIdTagPDF } from '../utils/idTag.js';

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
  const { attendees, refresh, create, update, remove } = useAttendees({ enabled: isAuthed });

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

  async function seedDemo() {
    if (!confirm('Add 3 sample registrants? (Existing data is kept.)')) return;
    const samples = [
      { fname:'Maria',    lname:'Santos', birthday:'1985-04-12', chapter:'Cagayan',       category:'earlybird', barAdmission:'2012', email:'maria.santos@example.com',    phone:'+63 917 111 1111', rollnum:'45678' },
      { fname:'Jose',     lname:'Reyes',  birthday:'1978-09-30', chapter:'Nueva Vizcaya', category:'regular',   barAdmission:'2005', email:'jose.reyes@example.com',      phone:'+63 917 222 2222', rollnum:'34567' },
      { fname:'Liwayway', lname:'Aquino', birthday:'1962-01-05', chapter:'Isabela',       category:'senior',    barAdmission:'1990', email:'liwayway.aquino@example.com', phone:'+63 917 333 3333', rollnum:'23456' }
    ];
    for (let i = 0; i < samples.length; i++) {
      const s = samples[i];
      await create({
        ref: 'IBP-NL-' + (Date.now() + i).toString().slice(-7),
        ...s,
        paid: i !== 0
      });
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
        onSeedDemo={seedDemo}
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
