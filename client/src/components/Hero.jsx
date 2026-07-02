import { EVENT_INFO } from '../config/event.js';

export default function Hero() {
  return (
    <header className="hero">
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
      <p className="hero-eyebrow">Integrated Bar of the Philippines</p>
      <h1 className="hero-title">North Luzon Regional Convention</h1>
      <p className="hero-subtitle">IBP {EVENT_INFO.region} · Official Registration</p>
      <div className="hero-theme-wrap">
        <span className="hero-theme-en">"{EVENT_INFO.theme}"</span>
      </div>
    </header>
  );
}
