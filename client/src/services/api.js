// ──────────────────────────────────────────────────────────────
// Data-source façade.
//
// The rest of the app imports from this file only. Switching from
// localStorage to a real backend is one env-var flip.
// ──────────────────────────────────────────────────────────────

import * as local from './localStorageAdapter.js';
import * as api   from './apiAdapter.js';

const MODE = (import.meta.env.VITE_API_MODE || 'local').toLowerCase();
const adapter = MODE === 'api' ? api : local;

// Attendees
export const listAttendees    = adapter.listAttendees;
export const findAttendee     = adapter.findAttendee;
export const createAttendee   = adapter.createAttendee;
export const updateAttendee   = adapter.updateAttendee;
export const deleteAttendee   = adapter.deleteAttendee;

// Auth
export const adminLogin         = adapter.adminLogin;
export const adminLogout        = adapter.adminLogout;
export const isAdminAuthed      = adapter.isAdminAuthed;
export const currentUser        = adapter.currentUser;
export const refreshCurrentUser = adapter.refreshCurrentUser;
export const changeOwnPassword  = adapter.changeOwnPassword;

// Users (server mode only)
export const listUsers          = adapter.listUsers;
export const createUser         = adapter.createUser;
export const updateUser         = adapter.updateUser;
export const deleteUser         = adapter.deleteUser;
export const resetUserPassword  = adapter.resetUserPassword;

export const API_MODE = MODE;
export const isApiMode = MODE === 'api';
