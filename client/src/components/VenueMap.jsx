import { VENUE_LOCATION, NEARBY_HOTELS } from '../config/event.js';

const mapsLink = (q) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;

const embedSrc = (q) =>
  `https://maps.google.com/maps?q=${encodeURIComponent(q)}&z=15&output=embed`;

const hotelsLink = mapsLink(`hotels near ${VENUE_LOCATION.mapsQuery}`);

export default function VenueMap() {
  return (
    <section className="venue-map-section">
      <div className="venue-map-inner">
        <header className="venue-map-head">
          <span className="venue-map-eyebrow">Getting there</span>
          <h2 className="venue-map-title">{VENUE_LOCATION.name}</h2>
          <p className="venue-map-address">{VENUE_LOCATION.address}</p>
          <div className="venue-map-actions">
            <a
              className="venue-map-btn primary"
              href={mapsLink(VENUE_LOCATION.mapsQuery)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="ti ti-map-pin" aria-hidden="true"></i> Open in Google Maps
            </a>
            <a
              className="venue-map-btn"
              href={hotelsLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="ti ti-bed" aria-hidden="true"></i> Search all nearby hotels
            </a>
          </div>
        </header>

        <div className="venue-map-frame">
          <iframe
            title={`Map of ${VENUE_LOCATION.name}`}
            src={embedSrc(VENUE_LOCATION.mapsQuery)}
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>

        <h3 className="venue-hotels-title">Nearby hotels</h3>
        <div className="venue-hotels-grid">
          {NEARBY_HOTELS.map((h) => (
            <a
              key={h.name}
              className="venue-hotel-card"
              href={mapsLink(h.mapsQuery)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="venue-hotel-name">
                <i className="ti ti-building" aria-hidden="true"></i>
                <span>{h.name}</span>
              </div>
              {h.distance && (
                <div className="venue-hotel-distance">{h.distance}</div>
              )}
              {h.notes && <div className="venue-hotel-notes">{h.notes}</div>}
              <div className="venue-hotel-cta">
                View on Maps <i className="ti ti-arrow-up-right" aria-hidden="true"></i>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
