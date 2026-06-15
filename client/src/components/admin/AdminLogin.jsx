import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function AdminLogin({ onLogin }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    const res = await onLogin(password);
    setBusy(false);
    if (!res.ok) setError(res.error || 'Incorrect password.');
    else setPassword('');
  }

  return (
    <div className="admin-login-wrap">
      <form className="admin-login-card" onSubmit={handleSubmit}>
        <div className="modal-icon"><i className="ti ti-shield-lock" aria-hidden="true"></i></div>
        <h2>Admin Portal</h2>
        <p className="sub">IBP North Luzon Convention · Sign in to continue</p>
        <input
          type="password"
          placeholder="Enter admin password"
          autoComplete="current-password"
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <div className="login-err">{error}</div>}
        <button className="submit-btn" type="submit" disabled={busy}>
          <i className={`ti ${busy ? 'ti-loader-2' : 'ti-login'}`} aria-hidden="true"></i>
          {busy ? 'Signing in...' : 'Sign In'}
        </button>
        <Link to="/" className="back-to-form">← Back to registration</Link>
      </form>
    </div>
  );
}
