import { PROMO, STANDARD_FEE } from '../config/event.js';

export default function PromoInfo() {
  return (
    <section className="promo-info-section">
      <div className="promo-info-inner">
        <div className="promo-info-head">
          <span className="promo-info-eyebrow">Registration Rate</span>
          <h2 className="promo-info-title">{STANDARD_FEE} for All Delegates</h2>
          <p className="promo-info-sub">
            A single, all-inclusive convention rate — no categories or eligibility requirements.
            Simply complete the form below and pay {STANDARD_FEE}.
          </p>
        </div>

        <div className="promo-reimburse">
          <div className="promo-reimburse-head">
            <i className="ti ti-cash-banknote" aria-hidden="true"></i>
            <span>Already paid the Early Bird (₱6,000) or Regular (₱7,000) rate?</span>
          </div>
          <p>
            You'll be refunded the difference to match the {STANDARD_FEE} rate —
            {' '}<strong>₱{PROMO.refund.earlybird.toLocaleString()}</strong> back for Early Bird,
            {' '}<strong>₱{PROMO.refund.regular.toLocaleString()}</strong> back for Regular.
          </p>
          <p className="promo-refund-note">
            <i className="ti ti-info-circle" aria-hidden="true"></i>
            Refunds will be rolled out <strong>after the convention</strong>. No action is needed now —
            details on the disbursement process will be announced.
          </p>
        </div>
      </div>
    </section>
  );
}
