import { useEffect, useState } from 'react';
import { EARLYBIRD_WINDOW, REGISTRATION_TYPES, isEarlyBirdOpen } from '../config/event.js';

// Deadline = local midnight after the last promo day, so Aug 13 counts in full.
function earlyBirdDeadline() {
  const d = new Date(`${EARLYBIRD_WINDOW.end}T00:00:00`);
  d.setDate(d.getDate() + 1);
  return d.getTime();
}

function splitRemaining(ms) {
  const s = Math.floor(Math.max(0, ms) / 1000);
  return {
    days:    Math.floor(s / 86400),
    hours:   Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
  };
}

const pad = (n) => String(n).padStart(2, '0');

export default function EarlyBirdCountdown() {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  // Once the promo closes, the countdown disappears entirely.
  if (!isEarlyBirdOpen()) return null;

  const { days, hours, minutes, seconds } = splitRemaining(earlyBirdDeadline() - now);
  const ebFee = REGISTRATION_TYPES.find((t) => t.value === 'earlybird')?.fee;

  return (
    <section className="eb-countdown" aria-label="Early Bird registration countdown">
      <div className="eb-countdown-inner">
        <div className="eb-countdown-head">
          <i className="ti ti-clock-hour-4" aria-hidden="true"></i>
          <span>Early Bird ends in</span>
        </div>
        <div className="eb-timer" role="timer">
          <div className="eb-unit"><span className="eb-num">{days}</span><span className="eb-lbl">Days</span></div>
          <span className="eb-sep">:</span>
          <div className="eb-unit"><span className="eb-num">{pad(hours)}</span><span className="eb-lbl">Hours</span></div>
          <span className="eb-sep">:</span>
          <div className="eb-unit"><span className="eb-num">{pad(minutes)}</span><span className="eb-lbl">Minutes</span></div>
          <span className="eb-sep">:</span>
          <div className="eb-unit"><span className="eb-num">{pad(seconds)}</span><span className="eb-lbl">Seconds</span></div>
        </div>
        <div className="eb-countdown-sub">
          Register on or before <span className="eb-emph">{EARLYBIRD_WINDOW.endLabel}</span>
          {ebFee ? <> for the <span className="eb-emph">{ebFee}</span> Early Bird rate.</> : '.'}
        </div>
      </div>
    </section>
  );
}
