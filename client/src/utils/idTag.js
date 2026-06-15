import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import { EVENT_INFO, CATEGORY_LABELS } from '../config/event.js';

// ──────────────────────────────────────────────────────────────
// 3" × 4" portrait ID name tag with QR code, designed to print
// at 100% / "Actual size" on cardstock for a lanyard holder.
// ──────────────────────────────────────────────────────────────

// Badge colors — RGB triplets matching the on-screen .badge styles.
// Format: [textR, textG, textB, bgR, bgG, bgB]
const BADGE_COLORS = {
  earlybird: [22, 101, 52,   220, 252, 231],  // green
  regular:   [30, 64, 175,   219, 234, 254],  // blue
  walkin:    [159, 18, 57,   255, 228, 230],  // rose
  senior:    [17, 94, 89,    204, 251, 241],  // teal
  _default:  [91, 33, 182,   237, 232, 252]   // purple fallback
};

/** Auto-shrink font size until the text fits within maxWidth (in current units). */
function fitFontSize(doc, text, maxWidth, startSize, minSize = 8) {
  let size = startSize;
  doc.setFontSize(size);
  while (doc.getTextWidth(text) > maxWidth && size > minSize) {
    size -= 0.5;
    doc.setFontSize(size);
  }
  return size;
}

export async function generateIdTagPDF(attendee) {
  // 3" wide × 4" tall, portrait
  const W = 3, H = 4;
  const doc = new jsPDF({ orientation: 'portrait', unit: 'in', format: [W, H] });

  // ─── White background ─────────────────────────────────────
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, W, H, 'F');

  // ─── Top purple header strip ──────────────────────────────
  doc.setFillColor(76, 29, 149);  // #4c1d95
  doc.rect(0, 0, W, 0.6, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text('IBP NORTH LUZON', W / 2, 0.28, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(220, 200, 255);
  doc.text('Regional Convention', W / 2, 0.45, { align: 'center' });

  // ─── QR code (centered, ~1.4" square) ─────────────────────
  const qrSize = 1.4;
  const payload = JSON.stringify({
    ref:  attendee.ref,
    name: `${attendee.fname} ${attendee.lname}`
  });
  const qrDataUrl = await QRCode.toDataURL(payload, {
    width: 480,
    margin: 1,
    color: { dark: '#2a1a40', light: '#ffffff' },
    errorCorrectionLevel: 'H'
  });
  const qrX = (W - qrSize) / 2;
  const qrY = 0.8;
  doc.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);

  // Subtle border around QR for definition
  doc.setDrawColor(180, 130, 255);
  doc.setLineWidth(0.01);
  doc.rect(qrX - 0.04, qrY - 0.04, qrSize + 0.08, qrSize + 0.08);

  // ─── Name (auto-fit) ──────────────────────────────────────
  const fullName = [attendee.fname, attendee.mname, attendee.lname].filter(Boolean).join(' ');
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(42, 26, 64);
  fitFontSize(doc, fullName, W - 0.3, 15, 9);
  doc.text(fullName, W / 2, 2.55, { align: 'center' });

  // ─── Ref number (monospace) ───────────────────────────────
  doc.setFont('courier', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(91, 33, 182);
  doc.text(attendee.ref, W / 2, 2.78, { align: 'center' });

  // ─── Chapter ──────────────────────────────────────────────
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(106, 77, 142);
  const chapterLabel = attendee.chapter ? `${attendee.chapter} Chapter` : '';
  if (chapterLabel) doc.text(chapterLabel, W / 2, 3.02, { align: 'center' });

  // ─── Category badge ───────────────────────────────────────
  const catLabel = CATEGORY_LABELS[attendee.category] || attendee.category || '';
  if (catLabel) {
    const [tr, tg, tb, br, bg, bb] = BADGE_COLORS[attendee.category] || BADGE_COLORS._default;
    const badgeW = 1.5, badgeH = 0.3;
    const badgeX = (W - badgeW) / 2;
    const badgeY = 3.2;

    doc.setFillColor(br, bg, bb);
    doc.roundedRect(badgeX, badgeY, badgeW, badgeH, 0.09, 0.09, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(tr, tg, tb);
    doc.text(catLabel.toUpperCase(), W / 2, badgeY + 0.19, { align: 'center' });
  }

  // ─── Bottom purple footer strip ───────────────────────────
  const footerH = 0.45;
  doc.setFillColor(76, 29, 149);
  doc.rect(0, H - footerH, W, footerH, 'F');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(220, 200, 255);
  doc.text(EVENT_INFO.date, W / 2, H - 0.24, { align: 'center' });

  doc.setFontSize(6);
  doc.setTextColor(200, 170, 255);
  doc.text('OFFICIAL ATTENDEE', W / 2, H - 0.1, { align: 'center' });

  // ─── Outer border ─────────────────────────────────────────
  doc.setDrawColor(76, 29, 149);
  doc.setLineWidth(0.02);
  doc.rect(0.04, 0.04, W - 0.08, H - 0.08);

  // ─── Save ─────────────────────────────────────────────────
  const safeName = fullName.replace(/[^a-z0-9]+/gi, '_');
  doc.save(`IDTag_${safeName}_${attendee.ref}.pdf`);
}
