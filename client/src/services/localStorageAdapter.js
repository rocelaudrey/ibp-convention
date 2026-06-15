// localStorage-backed implementation of the data API.
// Same shape as apiAdapter.js so they're interchangeable.

import { LOCAL_ADMIN_PASSWORD } from '../config/event.js';

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
    rollnum: '', chapter: '', position: '', category: '',
    dietary: '',
    proofName: '', proofType: '', proofDataUrl: null,
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
    // Quota — try again without the proof image
    attendee.proofDataUrl = null;
    write(list);
    console.warn('Saved without proof image due to storage quota.');
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

export async function adminLogin(password) {
  if (password === LOCAL_ADMIN_PASSWORD) {
    sessionStorage.setItem(SESSION_KEY, '1');
    return { ok: true };
  }
  return { ok: false, error: 'Incorrect password.' };
}

export async function adminLogout() {
  sessionStorage.removeItem(SESSION_KEY);
  return { ok: true };
}

export function isAdminAuthed() {
  return sessionStorage.getItem(SESSION_KEY) === '1';
}
