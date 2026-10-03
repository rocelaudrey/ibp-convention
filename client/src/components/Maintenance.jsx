import { EVENT_INFO } from '../config/event.js';

export default function Maintenance() {
  return (
    <div className="page-bg maintenance-bg">
      <div className="maintenance-wrap">
        <div className="ibp-logo-wrap">
          <img
            src="/ibp-logo.webp"
            alt="Integrated Bar of the Philippines"
            onError={(e) => {
              e.currentTarget.parentElement.innerHTML =
                '<i class="ti ti-scale" style="font-size:44px;color:#7c3aed;"></i>';
            }}
          />
        </div>
        <p className="hero-eyebrow">Integrated Bar of the Philippines</p>
        <h1 className="maintenance-title">Registration Temporarily Unavailable</h1>
        <p className="maintenance-msg">
          We're preparing some updates to the {EVENT_INFO.title} registration.
          The page will be back online shortly — thank you for your patience.
        </p>
        <div className="maintenance-meta">
          <div><i className="ti ti-calendar-event" aria-hidden="true"></i> {EVENT_INFO.date}</div>
          <div><i className="ti ti-map-pin" aria-hidden="true"></i> {EVENT_INFO.venue}</div>
        </div>
        <p className="maintenance-contact">
          For urgent concerns, contact{' '}
          <a href={`mailto:${EVENT_INFO.email}`}>{EVENT_INFO.email}</a>.
        </p>
      </div>
    </div>
  );
}
