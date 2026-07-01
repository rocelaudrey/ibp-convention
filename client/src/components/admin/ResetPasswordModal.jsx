import { useState } from 'react';

export default function ResetPasswordModal({ user, onClose, onSave }) {
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [busy, setBusy]         = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (password.length < 8) {
      return setError('Password must be at least 8 characters.');
    }
    setBusy(true);
    try {
      await onSave(password);
    } catch (err) {
      setError(err.message || 'Failed to reset password.');
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
        <h2 className="modal-title">Reset password</h2>
        <p className="modal-sub">
          Set a new password for <strong>{user.username}</strong>. They'll use this to sign in next time.
        </p>

        <form onSubmit={handleSubmit} className="user-form">
          <div className="field-group">
            <label htmlFor="rp-password">New password <span className="req">*</span></label>
            <input
              id="rp-password"
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              autoFocus
            />
            <small className="hint">Share this with them securely.</small>
          </div>

          {error && <div className="modal-error">{error}</div>}

          <div className="modal-actions">
            <button type="button" className="admin-btn" onClick={onClose} disabled={busy}>Cancel</button>
            <button type="submit" className="admin-btn primary" disabled={busy}>
              <i className={`ti ${busy ? 'ti-loader-2' : 'ti-key'}`} aria-hidden="true"></i>
              {busy ? 'Saving…' : 'Reset password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
