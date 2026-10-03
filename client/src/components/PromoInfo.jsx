import { PROMO } from '../config/event.js';

export default function PromoInfo() {
  return (
    <section className="promo-info-section">
      <div className="promo-info-inner">
        <div className="promo-info-head">
          <span className="promo-info-eyebrow">Special Promo Rate</span>
          <h2 className="promo-info-title">₱4,500 for Newly Admitted &amp; Government Lawyers</h2>
          <p className="promo-info-sub">
            A discounted net rate, availed individually — no pairing or bundling required.
            Choose "Special Promo – ₱4,500" in the registration form and upload a verification document.
          </p>
        </div>

        <div className="promo-cards">
          {PROMO.categories.map((c) => (
            <div className="promo-card" key={c.code}>
              <div className="promo-card-title">Category {c.code}: {c.label}</div>
              <div className="promo-card-hint">{c.hint}</div>
              <div className="promo-card-docs-label">Accepted proof (any one):</div>
              <ul className="promo-card-docs">
                {c.docs.map((d, i) => <li key={i}>{d}</li>)}
              </ul>
            </div>
          ))}
        </div>

        <div className="promo-reimburse">
          <div className="promo-reimburse-head">
            <i className="ti ti-cash-banknote" aria-hidden="true"></i>
            <span>Already registered at the Regular or Early Bird rate?</span>
          </div>
          <p>
            Qualified delegates who already paid may claim a partial refund to match the ₱4,500 net rate:
            {' '}<strong>₱{PROMO.refund.earlybird.toLocaleString()}</strong> back for Early Bird (₱6,000),
            {' '}<strong>₱{PROMO.refund.regular.toLocaleString()}</strong> back for Regular (₱7,000).
          </p>
          <p>
            Claims are processed <strong>walk-in</strong> at {PROMO.reimburseDeadlineLabel}. Download the
            application form, fill it out, and bring it together with your proof of payment and a
            verification document from your category above.
          </p>
          <a className="promo-download-btn" href={PROMO.formUrl} download>
            <i className="ti ti-download" aria-hidden="true"></i> Download Reimbursement Form &amp; Guidelines
          </a>
        </div>
      </div>
    </section>
  );
}
