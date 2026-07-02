import { useCallback, useState } from 'react';
import ScanQrModal from './ScanQrModal.jsx';

export default function CheckInBar({ attendees, onCheckIn }) {
  const [value, setValue] = useState('');
  const [result, setResult] = useState({ tone: '', text: '' });
  const [scanning, setScanning] = useState(false);

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
  }, [attendees, onCheckIn]); // eslint-disable-line react-hooks/exhaustive-deps

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
