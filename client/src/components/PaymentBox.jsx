import { REGISTRATION_TYPES } from '../config/event.js';

export default function PaymentBox() {
  return (
    <div className="payment-box">
      <div className="payment-inner">

        <div className="qr-block" aria-label="QR Code placeholder for payment">
          <i className="ti ti-qrcode" aria-hidden="true"></i>
          <span>QR Code<br />for Payment</span>
        </div>

        <div className="payment-info">
          <h4>Registration Fees</h4>
          {REGISTRATION_TYPES.map(t => (
            <div className="fee-row" key={t.value}>
              <span>{t.label}</span>
              <span className="fee-amount">{t.fee}</span>
            </div>
          ))}
          <p className="payment-note">
            Scan the QR code using GCash, Maya, or any supported e-wallet.
            Use your full name as the payment reference/note.
          </p>
        </div>

      </div>
    </div>
  );
}
