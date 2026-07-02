import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Html5Qrcode } from 'html5-qrcode';

const READER_ID = 'ci-qr-reader';

export default function ScanQrModal({ onDetected, onClose }) {
  const scannerRef = useRef(null);
  const [error, setError] = useState('');
  const [starting, setStarting] = useState(true);

  useEffect(() => {
    let cancelled = false;
    let instance = null;

    async function start() {
      try {
        instance = new Html5Qrcode(READER_ID);
        scannerRef.current = instance;

        await instance.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 260, height: 260 } },
          (decodedText) => {
            // Fire once, then stop and let the parent decide what to do.
            if (!cancelled) {
              cancelled = true;
              instance.stop().catch(() => {}).finally(() => onDetected(decodedText));
            }
          },
          () => { /* per-frame decode failures are noise — ignore */ }
        );
        if (!cancelled) setStarting(false);
      } catch (e) {
        if (!cancelled) {
          setStarting(false);
          setError(e?.message || 'Could not start the camera. Check permissions and try again.');
        }
      }
    }

    start();

    return () => {
      cancelled = true;
      const s = scannerRef.current;
      if (s) {
        s.stop().catch(() => {}).finally(() => {
          try { s.clear(); } catch { /* noop */ }
        });
      }
    };
  }, [onDetected]);

  return createPortal(
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }} role="dialog" aria-modal="true">
      <div className="modal-card scan-modal">
        <button className="modal-close-x" onClick={onClose} aria-label="Close">
          <i className="ti ti-x" aria-hidden="true"></i>
        </button>
        <h3>Scan QR Code</h3>
        <p className="modal-sub">Point the camera at an attendee's registration QR to check them in.</p>

        <div id={READER_ID} className="qr-reader" />

        {starting && !error && (
          <div className="scan-status">
            <i className="ti ti-loader-2 spin" aria-hidden="true"></i>
            <span>Starting camera…</span>
          </div>
        )}
        {error && (
          <div className="scan-error">
            <i className="ti ti-camera-off" aria-hidden="true"></i>
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
