import { Link, useLocation } from 'react-router-dom';

const ROLE_LABEL = {
  super_admin: 'Super Admin',
  staff: 'Staff',
};

export default function AdminHeader({ user, isSuperAdmin, onLogout }) {
  const { pathname } = useLocation();
  const onDashboard = pathname === '/admin';
  const onUsers     = pathname.startsWith('/admin/users');
  const onReports   = pathname.startsWith('/admin/reports');

  return (
    <header className="admin-header">
      <div className="ah-left">
        <div className="ah-logo">
          <img src="/ibp-logo.webp" alt="IBP" />
        </div>
        <div>
          <h1>Convention Admin</h1>
          <div className="ah-sub">IBP North Luzon</div>
        </div>
      </div>
      <div className="ah-right">
        {user && (
          <div className="ah-user">
            <div className="ah-user-name">{user.name || user.username}</div>
            <div className="ah-user-role">{ROLE_LABEL[user.role] || user.role}</div>
          </div>
        )}
        {!onDashboard && (
          <Link className="admin-btn" to="/admin">
            <i className="ti ti-layout-dashboard" aria-hidden="true"></i> Dashboard
          </Link>
        )}
        {!onReports && (
          <Link className="admin-btn" to="/admin/reports">
            <i className="ti ti-report-analytics" aria-hidden="true"></i> Reports
          </Link>
        )}
        {isSuperAdmin && !onUsers && (
          <Link className="admin-btn" to="/admin/users">
            <i className="ti ti-users" aria-hidden="true"></i> Users
          </Link>
        )}
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
