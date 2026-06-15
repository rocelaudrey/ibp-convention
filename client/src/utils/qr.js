import QRCode from 'qrcode';

export async function generateQRDataURL(text, size = 256) {
  return QRCode.toDataURL(text, {
    width: size,
    margin: 1,
    color: { dark: '#2a1a40', light: '#ffffff' },
    errorCorrectionLevel: 'H'
  });
}

export function buildQrPayload(attendee) {
  // Compact JSON the admin's check-in scanner understands.
  return JSON.stringify({
    ref: attendee.ref,
    name: `${attendee.fname} ${attendee.lname}`
  });
}

export function downloadDataURL(dataUrl, filename) {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
