import { useState } from 'react';

export default function CheckInBar({ attendees, onCheckIn }) {
  const [value, setValue] = useState('');
  const [result, setResult] = useState({ tone: '', text: '' });

  async function submit() {
    const raw = value.trim();
    if (!raw) return setResult({ tone: 'err', text: 'Enter or scan a reference number.' });

    // Accept JSON QR payload or a plain ref string.
    let ref = raw;
    try {
      const obj = JSON.parse(raw);
      if (obj && obj.ref) ref = obj.ref;
    } catch { /* not JSON */ }

    const a = attendees.find(x => x.ref === ref);
    if (!a) {
      setResult({ tone: 'err', text: `No registrant found for "${ref}"` });
      return;
    }
    if (a.checkedIn) {
      setResult({ tone: '', text: `${a.fname} ${a.lname} was already checked in.` });
    } else {
      await onCheckIn(a.ref);
      setResult({ tone: 'ok', text: `✓ Checked in: ${a.fname} ${a.lname} (${a.chapter || ''})` });
    }
    setValue('');
  }

  return (
    <div style={{ padding: '1rem 1.5rem 0' }}>
      <div className="checkin-bar">
        <div className="ci-icon"><i className="ti ti-qrcode-scan" aria-hidden="true"></i></div>
        <input
          type="text"
          placeholder="Scan or paste reference number (e.g. IBP-NL-1234567)"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') submit(); }}
        />
        <button onClick={submit}>
          <i className="ti ti-check" aria-hidden="true"></i> Check In
        </button>
        {result.text && (
          <span className={`ci-result${result.tone ? ' ' + result.tone : ''}`}>{result.text}</span>
        )}
      </div>
    </div>
  );
}
