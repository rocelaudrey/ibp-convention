import { EVENT_INFO } from '../config/event.js';

function Item({ icon, label, value }) {
  return (
    <div className="event-detail-item">
      <i className={`ti ${icon} edi-icon`} aria-hidden="true"></i>
      <div>
        <div className="edi-label">{label}</div>
        <div className="edi-value">{value}</div>
      </div>
    </div>
  );
}

export default function EventDetails() {
  return (
    <div className="event-strip">
      <div className="event-details-card">
        <Item icon="ti-calendar-event" label="Event Date" value={EVENT_INFO.date} />
        <Item icon="ti-map-pin"        label="Venue"      value={EVENT_INFO.venue} />
        <Item icon="ti-mail"           label="Inquiries"  value={EVENT_INFO.email} />
      </div>
    </div>
  );
}
