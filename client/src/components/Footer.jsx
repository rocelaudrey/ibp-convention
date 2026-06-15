import { Link } from 'react-router-dom';
import { EVENT_INFO } from '../config/event.js';

export default function Footer() {
  return (
    <footer className="page-footer">
      <p>Integrated Bar of the Philippines · {EVENT_INFO.region}</p>
      <p style={{ marginTop: 4 }}>
        For registration concerns, contact:{' '}
        <a
          href={`mailto:${EVENT_INFO.email}`}
          style={{ color: 'rgba(175,135,230,0.55)', textDecoration: 'none' }}
        >
          {EVENT_INFO.email}
        </a>
      </p>
      <p style={{ marginTop: 10 }}>
        <Link to="/admin" className="admin-link">
          <i className="ti ti-shield-lock" style={{ verticalAlign: '-2px' }}></i> Admin Portal
        </Link>
      </p>
    </footer>
  );
}
