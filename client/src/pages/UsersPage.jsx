import { useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '../hooks/useAdminAuth.js';
import { isApiMode } from '../services/api.js';
import * as api from '../services/api.js';

import AdminHeader from '../components/admin/AdminHeader.jsx';
import AdminLogin from '../components/admin/AdminLogin.jsx';
import ServerRequired from '../components/admin/ServerRequired.jsx';
import UserFormModal from '../components/admin/UserFormModal.jsx';
import ResetPasswordModal from '../components/admin/ResetPasswordModal.jsx';

const ROLE_LABEL = { super_admin: 'Super Admin', staff: 'Staff' };

function fmt(iso) {
  if (!iso) return '—';
  try { return new Date(iso).toLocaleString(); } catch { return iso; }
}

export default function UsersPage() {
  const { isAuthed, user: me, isSuperAdmin, login, logout } = useAdminAuth();

  const [users, setUsers]   = useState([]);
  const [loading, setLoad]  = useState(true);
  const [error, setError]   = useState('');
  const [editing, setEdit]  = useState(null);   // user obj or 'new'
  const [resetFor, setReset] = useState(null);  // user obj

  async function refresh() {
    setLoad(true);
    try {
      const list = await api.listUsers();
      setUsers(list);
      setError('');
    } catch (e) {
      setError(e.message || 'Failed to load users.');
    } finally {
      setLoad(false);
    }
  }

  useEffect(() => {
    if (isAuthed && isSuperAdmin) refresh();
  }, [isAuthed, isSuperAdmin]);

  const sorted = useMemo(
    () => [...users].sort((a, b) => a.username.localeCompare(b.username)),
    [users]
  );

  // ── access gates ───────────────────────────────────────────
  if (!isApiMode) return <ServerRequired />;
  if (!isAuthed)  return <AdminLogin onLogin={login} />;
  if (!isSuperAdmin) return <Navigate to="/admin" replace />;

  // ── actions ────────────────────────────────────────────────
  async function saveUser(payload, existing) {
    try {
      if (existing) {
        const { name, role, active } = payload;
        await api.updateUser(existing.id, { name, role, active });
      } else {
        await api.createUser(payload);
      }
      setEdit(null);
      await refresh();
    } catch (e) {
      throw e;
    }
  }

  async function resetPassword(newPassword) {
    if (!resetFor) return;
    await api.resetUserPassword(resetFor.id, newPassword);
    setReset(null);
  }

  async function toggleActive(u) {
    try {
      await api.updateUser(u.id, { active: !u.active });
      await refresh();
    } catch (e) {
      alert(e.message);
    }
  }

  async function deleteUser(u) {
    if (!confirm(`Delete user "${u.username}"? This cannot be undone.`)) return;
    try {
      await api.deleteUser(u.id);
      await refresh();
    } catch (e) {
      alert(e.message);
    }
  }

  return (
    <div className="admin-view">
      <AdminHeader user={me} isSuperAdmin={isSuperAdmin} onLogout={logout} />

      <main className="users-main">
        <div className="users-head">
          <div>
            <h2 className="users-title">User Management</h2>
            <p className="users-sub">Manage admin accounts. Super admins can invite staff, reset passwords, and deactivate accounts.</p>
          </div>
          <button className="admin-btn primary" onClick={() => setEdit('new')}>
            <i className="ti ti-user-plus" aria-hidden="true"></i> New user
          </button>
        </div>

        {error && <div className="users-error">{error}</div>}

        <div className="users-table-wrap">
          <table className="users-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Name</th>
                <th>Role</th>
                <th>Status</th>
                <th>Last login</th>
                <th className="users-actions-col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan="6" className="users-empty">Loading…</td></tr>
              )}
              {!loading && sorted.length === 0 && (
                <tr><td colSpan="6" className="users-empty">No users yet.</td></tr>
              )}
              {!loading && sorted.map((u) => {
                const isMe = me?.id === u.id;
                return (
                  <tr key={u.id} className={u.active ? '' : 'row-inactive'}>
                    <td className="mono">{u.username}{isMe && <span className="me-badge">you</span>}</td>
                    <td>{u.name || '—'}</td>
                    <td><span className={`role-chip role-${u.role}`}>{ROLE_LABEL[u.role] || u.role}</span></td>
                    <td>
                      {u.active
                        ? <span className="status-chip status-active">Active</span>
                        : <span className="status-chip status-inactive">Inactive</span>}
                    </td>
                    <td className="dim">{fmt(u.lastLoginAt)}</td>
                    <td className="users-actions">
                      <button className="row-btn" onClick={() => setEdit(u)} title="Edit">
                        <i className="ti ti-edit" aria-hidden="true"></i>
                      </button>
                      <button className="row-btn" onClick={() => setReset(u)} title="Reset password">
                        <i className="ti ti-key" aria-hidden="true"></i>
                      </button>
                      <button
                        className="row-btn"
                        onClick={() => toggleActive(u)}
                        disabled={isMe}
                        title={isMe ? "You can't deactivate yourself" : (u.active ? 'Deactivate' : 'Activate')}
                      >
                        <i className={`ti ${u.active ? 'ti-user-off' : 'ti-user-check'}`} aria-hidden="true"></i>
                      </button>
                      <button
                        className="row-btn danger"
                        onClick={() => deleteUser(u)}
                        disabled={isMe}
                        title={isMe ? "You can't delete yourself" : 'Delete'}
                      >
                        <i className="ti ti-trash" aria-hidden="true"></i>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </main>

      {editing && (
        <UserFormModal
          existing={editing === 'new' ? null : editing}
          me={me}
          onClose={() => setEdit(null)}
          onSave={saveUser}
        />
      )}
      {resetFor && (
        <ResetPasswordModal
          user={resetFor}
          onClose={() => setReset(null)}
          onSave={resetPassword}
        />
      )}
    </div>
  );
}
