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
            Take a screenshot or download the QR code above.
          </p>
          {attendee.email ? (
            <div className="reg-email-note">
              <i className="ti ti-mail" aria-hidden="true"></i>
              <span>
                Once your payment is verified, a <strong>confirmation email</strong> with your
                QR code will be sent to <strong>{attendee.email}</strong>.
                {' '}If you don't see it, please check your <strong>Spam / Junk</strong> folder.
              </span>
            </div>
          ) : (
            <div className="reg-email-note">
              <i className="ti ti-alert-circle" aria-hidden="true"></i>
              <span>
                You didn't provide an email, so please <strong>save this QR code</strong> — it's
                your entry pass for check-in.
              </span>
            </div>
          )}
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
