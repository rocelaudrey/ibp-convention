import { useCallback, useState } from 'react';
import ScanQrModal from './ScanQrModal.jsx';
import { CONVENTION_DAYS, currentConventionDay } from '../../config/event.js';

const fmtTime = (iso) => {
  try { return new Date(iso).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' }); }
  catch { return ''; }
};

export default function CheckInBar({ attendees, onCheckInDay }) {
  const [day, setDay] = useState(() => currentConventionDay());
  const [value, setValue] = useState('');
  const [result, setResult] = useState({ tone: '', text: '' });
  const [scanning, setScanning] = useState(false);

  const dayLabel = CONVENTION_DAYS.find((d) => d.day === day)?.label || `Day ${day}`;

  // Extract a ref from either a JSON QR payload or a plain string.
  function extractRef(raw) {
    const s = (raw || '').trim();
    if (!s) return '';
    try {
      const obj = JSON.parse(s);
      if (obj && obj.ref) return obj.ref;
    } catch { /* not JSON */ }
    return s;
  }

  async function checkInByRef(ref) {
    const a = attendees.find((x) => x.ref === ref);
    if (!a) {
      setResult({ tone: 'err', text: `No registrant found for "${ref}"` });
      return;
    }
    try {
      const res = await onCheckInDay(a.ref, day);
      const t = res?.at ? fmtTime(res.at) : '';
      if (res?.alreadyCheckedIn) {
        setResult({ tone: '', text: `${a.fname} ${a.lname} is already checked in for ${dayLabel}${t ? ' (' + t + ')' : ''}.` });
      } else {
        setResult({ tone: 'ok', text: `✓ ${dayLabel} check-in: ${a.fname} ${a.lname} (${a.chapter || ''})${t ? ' — ' + t : ''}` });
      }
    } catch (e) {
      setResult({ tone: 'err', text: e.message || 'Check-in failed.' });
    }
    setValue('');
  }

  async function submit() {
    const ref = extractRef(value);
    if (!ref) return setResult({ tone: 'err', text: 'Enter or scan a reference number.' });
    await checkInByRef(ref);
  }

  // Stable callback so ScanQrModal's effect doesn't retrigger every render.
  const handleScanned = useCallback((decoded) => {
    setScanning(false);
    const ref = extractRef(decoded);
    if (!ref) {
      setResult({ tone: 'err', text: 'Could not read a reference from the QR code.' });
      return;
    }
    setValue(ref);
    checkInByRef(ref);
  }, [attendees, onCheckInDay, day]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{ padding: '1rem 1.5rem 0' }}>
      <div className="checkin-bar">
        <div className="ci-icon"><i className="ti ti-qrcode-scan" aria-hidden="true"></i></div>
        <select
          className="ci-day"
          value={day}
          onChange={(e) => setDay(Number(e.target.value))}
          aria-label="Convention day to check in for"
          title="Convention day"
        >
          {CONVENTION_DAYS.map((d) => (
            <option key={d.day} value={d.day}>{d.label} · {d.sub}</option>
          ))}
        </select>
        <input
          type="text"
          placeholder={`Scan or paste ref to check in for ${dayLabel}`}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') submit(); }}
        />
        <button type="button" className="ci-scan" onClick={() => setScanning(true)}>
          <i className="ti ti-camera" aria-hidden="true"></i> Scan
        </button>
        <button type="button" onClick={submit}>
          <i className="ti ti-check" aria-hidden="true"></i> Check In
        </button>
        {result.text && (
          <span className={`ci-result${result.tone ? ' ' + result.tone : ''}`}>{result.text}</span>
        )}
      </div>

      {scanning && (
        <ScanQrModal
          onDetected={handleScanned}
          onClose={() => setScanning(false)}
        />
      )}
    </div>
  );
}
