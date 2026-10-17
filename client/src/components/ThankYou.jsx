import { EVENT_INFO } from '../config/event.js';

// Shown on the public page once the convention has concluded, in place of
// the registration form. Reuses the maintenance-screen styles. The admin
// panel is unaffected and stays open.
export default function ThankYou() {
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
        <p className="hero-eyebrow">Integrated Bar of the Philippines · Northern Luzon</p>
        <h1 className="maintenance-title">Maraming Salamat!</h1>
        <p className="maintenance-msg">
          The {EVENT_INFO.title} has successfully concluded. To all our
          delegates, speakers, sponsors, and partners — thank you for joining
          us and making these three days a meaningful success. We look forward
          to seeing you again.
        </p>
        <div className="maintenance-meta">
          <div><i className="ti ti-calendar-event" aria-hidden="true"></i> {EVENT_INFO.date}</div>
          <div><i className="ti ti-map-pin" aria-hidden="true"></i> {EVENT_INFO.venue}</div>
        </div>
        <p className="maintenance-contact">
          Announcements on certificates of attendance and reimbursement
          processing will follow. For any concerns, contact{' '}
          <a href={`mailto:${EVENT_INFO.email}`}>{EVENT_INFO.email}</a>.
        </p>
      </div>
    </div>
  );
}
