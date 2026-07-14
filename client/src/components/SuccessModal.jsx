import { createPortal } from 'react-dom';
import { downloadDataURL } from '../utils/qr.js';

export default function SuccessModal({ attendee, qrDataUrl, duplicate, onClose }) {
  return createPortal(
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }} role="dialog" aria-modal="true">
      <div className="modal-card">
        <div className="modal-icon"><i className="ti ti-check" aria-hidden="true"></i></div>
        <h3>{duplicate ? "You're already registered" : 'Registration Submitted!'}</h3>
        <p>
          {duplicate
            ? 'A registration already exists for your Roll of Attorneys Number, so we kept your original entry. Save the QR code below — it will be scanned for check-in on event day.'
            : 'Thank you for registering. Save the QR code below — it will be scanned for check-in on event day.'}
        </p>

        <div className="reg-qr-wrap">
          <div className="qr-canvas">
            {qrDataUrl && <img src={qrDataUrl} alt="Registration QR code" />}
          </div>
          <div className="ref-badge">REF #: {attendee.ref}</div>
          <p className="reg-qr-hint">
            Take a screenshot or download the QR. A copy will also be sent to your email if backend email is configured.
          </p>
        </div>

        <div className="modal-actions">
          <button
            type="button"
            className="modal-secondary-btn"
            onClick={() => qrDataUrl && downloadDataURL(qrDataUrl, `IBP-NL-QR-${attendee.ref}.png`)}
          >
            <i className="ti ti-download" aria-hidden="true"></i> Save QR
          </button>
          <button type="button" className="modal-close-btn" onClick={onClose}>Done</button>
        </div>
      </div>
    </div>,
    document.body
  );
}
