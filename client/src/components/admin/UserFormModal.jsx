import { useState } from 'react';

export default function UserFormModal({ existing, me, onClose, onSave }) {
  const isEdit = !!existing;
  const [username, setUsername] = useState(existing?.username || '');
  const [name, setName]         = useState(existing?.name || '');
  const [role, setRole]         = useState(existing?.role || 'staff');
  const [active, setActive]     = useState(existing ? existing.active : true);
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [busy, setBusy]         = useState(false);

  const isSelf = existing && me?.id === existing.id;

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!isEdit) {
      if (!username.trim() || username.trim().length < 3) {
        return setError('Username must be at least 3 characters.');
      }
      if (password.length < 8) {
        return setError('Password must be at least 8 characters.');
      }
    }

    setBusy(true);
    try {
      await onSave(
        isEdit
          ? { name, role, active }
          : { username: username.trim(), name, role, password },
        existing
      );
    } catch (err) {
      setError(err.message || 'Save failed.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card user-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          <i className="ti ti-x" aria-hidden="true"></i>
        </button>
        <h2 className="modal-title">{isEdit ? `Edit ${existing.username}` : 'New user'}</h2>

        <form onSubmit={handleSubmit} className="user-form">
          {!isEdit && (
            <div className="field-group">
              <label htmlFor="uf-username">Username <span className="req">*</span></label>
              <input
                id="uf-username"
                type="text"
                autoComplete="off"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                placeholder="e.g. juan.dela.cruz"
                autoFocus
              />
              <small className="hint">Lowercase, no spaces. Cannot be changed later.</small>
            </div>
          )}

          <div className="field-group">
            <label htmlFor="uf-name">Full name</label>
            <input
              id="uf-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Juan Dela Cruz"
            />
          </div>

          <div className="field-group">
            <label htmlFor="uf-role">Role <span className="req">*</span></label>
            <select
              id="uf-role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              disabled={isSelf}
              title={isSelf ? "You can't change your own role" : ''}
            >
              <option value="staff">Staff — check-in, edit, export</option>
              <option value="super_admin">Super Admin — full access, manage users</option>
            </select>
          </div>

          {isEdit && (
            <div className="field-group toggle-row">
              <label className="toggle-label">
                <input
                  type="checkbox"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  disabled={isSelf}
                />
                <span>Account active</span>
              </label>
              {isSelf && <small className="hint">You can't deactivate yourself.</small>}
            </div>
          )}

          {!isEdit && (
            <div className="field-group">
              <label htmlFor="uf-password">Initial password <span className="req">*</span></label>
              <input
                id="uf-password"
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
              />
              <small className="hint">Share this with the user securely. They can change it on first login.</small>
            </div>
          )}

          {error && <div className="modal-error">{error}</div>}

          <div className="modal-actions">
            <button type="button" className="admin-btn" onClick={onClose} disabled={busy}>
              Cancel
            </button>
            <button type="submit" className="admin-btn primary" disabled={busy}>
              <i className={`ti ${busy ? 'ti-loader-2' : 'ti-check'}`} aria-hidden="true"></i>
              {busy ? 'Saving…' : (isEdit ? 'Save changes' : 'Create user')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
