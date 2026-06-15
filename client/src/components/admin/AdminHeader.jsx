import { Link } from 'react-router-dom';

export default function AdminHeader({ onLogout }) {
  return (
    <header className="admin-header">
      <div className="ah-left">
        <div className="ah-logo"><i className="ti ti-shield-check" aria-hidden="true"></i></div>
        <div>
          <h1>Convention Admin</h1>
          <div className="ah-sub">IBP North Luzon</div>
        </div>
      </div>
      <div className="ah-right">
        <Link className="admin-btn" to="/">
          <i className="ti ti-arrow-left" aria-hidden="true"></i> Registration
        </Link>
        <button className="admin-btn danger" onClick={onLogout}>
          <i className="ti ti-logout" aria-hidden="true"></i> Logout
        </button>
      </div>
    </header>
  );
}
