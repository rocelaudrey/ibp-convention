// localStorage-backed implementation of the data API.
// Same shape as apiAdapter.js so they're interchangeable.
//
// Admin sign-in is intentionally disabled here — see adminLogin() below.

const STORAGE_KEY = 'ibpNLConvention.attendees';
const SESSION_KEY = 'ibpNLConvention.adminSession';

function read() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function write(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export async function listAttendees() {
  return read().sort((a, b) =>
    (b.registeredAt || '').localeCompare(a.registeredAt || '')
  );
}

export async function findAttendee(ref) {
  return read().find(a => a.ref === ref) || null;
}

export async function createAttendee(data) {
  const ref = data.ref || 'IBP-NL-' + Date.now().toString().slice(-7);
  const attendee = {
    ref,
    fname: '', lname: '', mname: '',
    birthday: '',
    email: '', phone: '',
    rollnum: '', chapter: '', barAdmission: '', category: '',
    dietary: '',
    proofName: '', proofType: '', proofDataUrl: null,
    pwdIdName: '', pwdIdType: '', pwdIdDataUrl: null,
    registeredAt: new Date().toISOString(),
    paid: false,
    checkedIn: false, checkedInAt: null,
    certificateIssued: false, certificateIssuedAt: null,
    ...data
  };
  const list = read();
  list.push(attendee);

  try {
    write(list);
  } catch (e) {
    // Quota — drop the binary blobs and retry.
    attendee.proofDataUrl = null;
    attendee.pwdIdDataUrl = null;
    write(list);
    console.warn('Saved without proof / PWD ID images due to storage quota.');
  }
  return attendee;
}

export async function updateAttendee(ref, patch) {
  const list = read();
  const idx = list.findIndex(a => a.ref === ref);
  if (idx === -1) return null;
  list[idx] = { ...list[idx], ...patch };
  write(list);
  return list[idx];
}

export async function deleteAttendee(ref) {
  const list = read().filter(a => a.ref !== ref);
  write(list);
  return { ok: true };
}

// Admin panel is server-only. In local (no backend) mode we hard-refuse
// login and expose a currentUser of null so the AdminPage can render the
// "server required" screen instead of a login form.
export async function adminLogin() {
  return {
    ok: false,
    error: 'Admin sign-in requires the API server. Set VITE_API_MODE=api and VITE_API_URL, then try again.',
  };
}

export async function adminLogout() {
  sessionStorage.removeItem(SESSION_KEY);
  return { ok: true };
}

export function isAdminAuthed() { return false; }
export function currentUser()   { return null; }
export async function refreshCurrentUser() { return null; }
export async function changeOwnPassword() { return { ok: false, error: 'Not available in local mode.' }; }

export async function listUsers()          { return []; }
export async function createUser()         { throw new Error('User management requires the API server.'); }
export async function updateUser()         { throw new Error('User management requires the API server.'); }
export async function deleteUser()         { throw new Error('User management requires the API server.'); }
export async function resetUserPassword()  { throw new Error('User management requires the API server.'); }
