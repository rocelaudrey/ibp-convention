// REST API implementation of the data adapter.
// Activated when VITE_API_MODE=api.
//
// Server endpoints expected:
//   POST   /api/auth/login         { password } -> { token }
//   GET    /api/attendees
//   GET    /api/attendees/:ref
//   POST   /api/attendees          (JSON body)
//   PATCH  /api/attendees/:ref
//   DELETE /api/attendees/:ref

const BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const TOKEN_KEY = 'ibpNLConvention.adminToken';

function url(path) {
  return `${BASE}${path}`;
}

function authHeaders() {
  const token = sessionStorage.getItem(TOKEN_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(path, options = {}) {
  const res = await fetch(url(path), {
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
      ...(options.headers || {})
    },
    ...options
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `${res.status} ${res.statusText}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

export async function listAttendees() {
  return request('/api/attendees');
}

export async function findAttendee(ref) {
  try {
    return await request(`/api/attendees/${encodeURIComponent(ref)}`);
  } catch {
    return null;
  }
}

export async function createAttendee(data) {
  return request('/api/attendees', { method: 'POST', body: JSON.stringify(data) });
}

export async function updateAttendee(ref, patch) {
  return request(`/api/attendees/${encodeURIComponent(ref)}`, {
    method: 'PATCH',
    body: JSON.stringify(patch)
  });
}

export async function deleteAttendee(ref) {
  return request(`/api/attendees/${encodeURIComponent(ref)}`, { method: 'DELETE' });
}

export async function adminLogin(password) {
  try {
    const { token } = await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ password })
    });
    if (!token) return { ok: false, error: 'No token returned.' };
    sessionStorage.setItem(TOKEN_KEY, token);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e.message || 'Login failed.' };
  }
}

export async function adminLogout() {
  sessionStorage.removeItem(TOKEN_KEY);
  return { ok: true };
}

export function isAdminAuthed() {
  return !!sessionStorage.getItem(TOKEN_KEY);
}
