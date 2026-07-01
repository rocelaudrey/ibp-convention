// REST API implementation of the data adapter.
// Activated when VITE_API_MODE=api.

const BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const TOKEN_KEY = 'ibpNLConvention.adminToken';
const USER_KEY  = 'ibpNLConvention.adminUser';

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
      ...(options.headers || {}),
    },
    ...options,
  });
  if (!res.ok) {
    let msg = `${res.status} ${res.statusText}`;
    try {
      const body = await res.json();
      if (body?.error) msg = body.error;
    } catch { /* not JSON */ }
    const err = new Error(msg);
    err.status = res.status;
    throw err;
  }
  if (res.status === 204) return null;
  return res.json();
}

// ── Attendees ────────────────────────────────────────────────
export async function listAttendees()             { return request('/api/attendees'); }
export async function findAttendee(ref) {
  try { return await request(`/api/attendees/${encodeURIComponent(ref)}`); }
  catch { return null; }
}
export async function createAttendee(data)        { return request('/api/attendees', { method: 'POST', body: JSON.stringify(data) }); }
export async function updateAttendee(ref, patch)  { return request(`/api/attendees/${encodeURIComponent(ref)}`, { method: 'PATCH', body: JSON.stringify(patch) }); }
export async function deleteAttendee(ref)         { return request(`/api/attendees/${encodeURIComponent(ref)}`, { method: 'DELETE' }); }

// ── Auth ─────────────────────────────────────────────────────
export async function adminLogin(username, password) {
  try {
    const { token, user } = await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    if (!token) return { ok: false, error: 'No token returned.' };
    sessionStorage.setItem(TOKEN_KEY, token);
    sessionStorage.setItem(USER_KEY, JSON.stringify(user));
    return { ok: true, user };
  } catch (e) {
    return { ok: false, error: e.message || 'Login failed.' };
  }
}

export async function adminLogout() {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
  return { ok: true };
}

export function isAdminAuthed() {
  return !!sessionStorage.getItem(TOKEN_KEY);
}

export function currentUser() {
  try {
    const raw = sessionStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function refreshCurrentUser() {
  try {
    const { user } = await request('/api/auth/me');
    sessionStorage.setItem(USER_KEY, JSON.stringify(user));
    return user;
  } catch (e) {
    if (e.status === 401) await adminLogout();
    return null;
  }
}

export async function changeOwnPassword(currentPassword, newPassword) {
  try {
    await request('/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

// ── User management (super_admin only) ───────────────────────
export async function listUsers()           { return request('/api/users'); }
export async function createUser(data)      { return request('/api/users', { method: 'POST', body: JSON.stringify(data) }); }
export async function updateUser(id, patch) { return request(`/api/users/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(patch) }); }
export async function deleteUser(id)        { return request(`/api/users/${encodeURIComponent(id)}`, { method: 'DELETE' }); }
export async function resetUserPassword(id, password) {
  return request(`/api/users/${encodeURIComponent(id)}/password`, {
    method: 'POST',
    body: JSON.stringify({ password }),
  });
}
