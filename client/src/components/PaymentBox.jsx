import { REGISTRATION_TYPES, EARLYBIRD_WINDOW, isEarlyBirdOpen } from '../config/event.js';

export default function PaymentBox() {
  const earlyBirdOpen = isEarlyBirdOpen();
  return (
    <div className="payment-box">
      <div className="payment-inner">

        <div className="qr-block" aria-label="BPI InstaPay QR code for payment">
          <img src="/bpi-instapay-qr.jpg" alt="BPI InstaPay QR — IBP NV" />
          <span className="qr-caption">BPI InstaPay · IBP NV</span>
        </div>

        <div className="payment-info">
          <h4>Registration Fees</h4>
          {REGISTRATION_TYPES.map(t => {
            const isEarly = t.value === 'earlybird';
            return (
              <div className={`fee-row${isEarly && !earlyBirdOpen ? ' fee-row-ended' : ''}`} key={t.value}>
                <span>
                  {t.label}
                  {isEarly && (
                    <small className="fee-window">
                      {earlyBirdOpen ? ` (until ${EARLYBIRD_WINDOW.endLabel})` : ' (promo ended)'}
                    </small>
                  )}
                </span>
                <span className="fee-amount">{t.fee}</span>
              </div>
            );
          })}
          <p className="payment-note">
            Scan the BPI InstaPay QR using any supported bank or e-wallet app.
            Use your full name as the payment reference/note. Transfer fees may apply.
          </p>
        </div>

      </div>
    </div>
  );
}
