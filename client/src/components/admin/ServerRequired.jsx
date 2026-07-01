import { Link } from 'react-router-dom';

export default function ServerRequired() {
  return (
    <div className="admin-login-wrap">
      <div className="admin-login-card">
        <div className="modal-icon"><i className="ti ti-server-off" aria-hidden="true"></i></div>
        <h2>Server Required</h2>
        <p className="sub" style={{ marginBottom: 14 }}>
          The admin panel is not available in local (browser-only) mode.
        </p>
        <div className="server-required-hint">
          <p>To enable the admin panel, set the following in <code>client/.env</code>:</p>
          <pre>{`VITE_API_MODE=api
VITE_API_URL=`}</pre>
          <p>and start the backend from <code>server/</code> with <code>npm run dev</code>.</p>
        </div>
        <Link to="/" className="back-to-form">← Back to registration</Link>
      </div>
    </div>
  );
}
