import { REGISTRATION_TYPES } from '../config/event.js';

export default function PaymentBox() {
  return (
    <div className="payment-box">
      <div className="payment-inner">

        <div className="qr-block" aria-label="BPI InstaPay QR code for payment">
          <img src="/bpi-instapay-qr.jpg" alt="BPI InstaPay QR — IBP NV" />
          <span className="qr-caption">BPI InstaPay · IBP NV</span>
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
            Scan the BPI InstaPay QR using any supported bank or e-wallet app.
            Use your full name as the payment reference/note. Transfer fees may apply.
          </p>
        </div>

      </div>
    </div>
  );
}
