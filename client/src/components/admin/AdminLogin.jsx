import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function AdminLogin({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    const res = await onLogin(username.trim(), password);
    setBusy(false);
    if (!res.ok) setError(res.error || 'Sign-in failed.');
    else { setUsername(''); setPassword(''); setShowPassword(false); }
  }

  return (
    <div className="admin-login-wrap">
      <form className="admin-login-card" onSubmit={handleSubmit}>
        <div className="modal-icon"><i className="ti ti-shield-lock" aria-hidden="true"></i></div>
        <h2>Admin Portal</h2>
        <p className="sub">IBP Northern Luzon Convention · Sign in to continue</p>
        <input
          type="text"
          placeholder="Username"
          autoComplete="username"
          autoFocus
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <div className="pw-field">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            className="pw-toggle"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            aria-pressed={showPassword}
            tabIndex={-1}
          >
            <i className={`ti ${showPassword ? 'ti-eye-off' : 'ti-eye'}`} aria-hidden="true"></i>
          </button>
        </div>
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
