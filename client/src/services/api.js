// ──────────────────────────────────────────────────────────────
// Data-source façade.
//
// The rest of the app imports from this file only. Switching from
// localStorage to a real backend is one env-var flip — no component
// changes needed.
// ──────────────────────────────────────────────────────────────

import * as local from './localStorageAdapter.js';
import * as api   from './apiAdapter.js';

const MODE = (import.meta.env.VITE_API_MODE || 'local').toLowerCase();
const adapter = MODE === 'api' ? api : local;

export const listAttendees    = adapter.listAttendees;
export const findAttendee     = adapter.findAttendee;
export const createAttendee   = adapter.createAttendee;
export const updateAttendee   = adapter.updateAttendee;
export const deleteAttendee   = adapter.deleteAttendee;
export const adminLogin       = adapter.adminLogin;
export const adminLogout      = adapter.adminLogout;
export const isAdminAuthed    = adapter.isAdminAuthed;

export const API_MODE = MODE;
