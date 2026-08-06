import jsPDF from 'jspdf';
import QRCode from 'qrcode';

// ──────────────────────────────────────────────────────────────
// Name tag built on the designed template image (public/nametag-template.jpg).
// The template supplies all the artwork (logo, header, DELEGATE banner);
// we only overlay the QR code, name, chapter, and reference number at
// coordinates measured against the template's layout.
// ──────────────────────────────────────────────────────────────

const TEMPLATE_URL = '/nametag-template.jpg';
const TEMPLATE_RATIO = 1167 / 1600; // width / height of the template image

// Page in inches, preserving the template's aspect ratio.
const PAGE_W = 4.0;
const PAGE_H = PAGE_W / TEMPLATE_RATIO; // ≈ 5.48"

// Layout as fractions of the page (measured from the template).
const BOX_CX = 0.5016;   // white QR box — center x
const BOX_CY = 0.4814;   // white QR box — center y
const BOX_W  = 0.5397;   // white QR box — width (fraction of page width)
const QR_SCALE = 0.86;   // QR fills 86% of the box

const X = (f) => f * PAGE_W;
const Y = (f) => f * PAGE_H;
const PT = (fracH) => fracH * PAGE_H * 72; // font size in points from a height fraction

// Cache the template as a data URL so bulk runs fetch it only once.
let templatePromise = null;
function loadTemplate() {
  if (templatePromise) return templatePromise;
  templatePromise = fetch(TEMPLATE_URL)
    .then((r) => r.blob())
    .then((blob) => new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(blob);
    }));
  return templatePromise;
}

/** Auto-shrink font size until the text fits within maxWidth (in current units). */
function fitFontSize(doc, text, maxWidth, startSize, minSize = 6) {
  let size = startSize;
  doc.setFontSize(size);
  while (doc.getTextWidth(text) > maxWidth && size > minSize) {
    size -= 0.5;
    doc.setFontSize(size);
  }
  return size;
}

/**
 * Draws one name tag on the CURRENT page of the given jsPDF instance.
 * `templateData` is the shared template data URL (pass once for bulk).
 */
export async function drawIdTagOnDoc(doc, attendee, templateData) {
  const tpl = templateData || (await loadTemplate());

  // Background template — same alias across pages keeps bulk PDFs small.
  doc.addImage(tpl, 'JPEG', 0, 0, PAGE_W, PAGE_H, 'nametag-tpl', 'FAST');

  // QR code centered in the white box.
  const qrW = BOX_W * QR_SCALE * PAGE_W;
  const qrX = X(BOX_CX) - qrW / 2;
  const qrY = Y(BOX_CY) - qrW / 2;
  const payload = JSON.stringify({
    ref: attendee.ref,
    name: `${attendee.fname} ${attendee.lname}`,
  });
  const qrDataUrl = await QRCode.toDataURL(payload, {
    width: 600, margin: 1, errorCorrectionLevel: 'H',
    color: { dark: '#2a1a40', light: '#ffffff' },
  });
  doc.addImage(qrDataUrl, 'PNG', qrX, qrY, qrW, qrW);

  // Name (with Atty. prefix), auto-fit to width.
  const name = `Atty. ${[attendee.fname, attendee.mname, attendee.lname].filter(Boolean).join(' ')}`;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(42, 26, 64);
  fitFontSize(doc, name, PAGE_W * 0.86, PT(0.046));
  doc.text(name, X(0.5), Y(0.735), { align: 'center' });

  // Chapter.
  if (attendee.chapter) {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(91, 33, 182);
    fitFontSize(doc, `${attendee.chapter} Chapter`, PAGE_W * 0.86, PT(0.030));
    doc.text(`${attendee.chapter} Chapter`, X(0.5), Y(0.788), { align: 'center' });
  }

  // Reference number.
  doc.setFont('courier', 'normal');
  doc.setTextColor(76, 29, 149);
  doc.setFontSize(PT(0.024));
  doc.text(attendee.ref, X(0.5), Y(0.828), { align: 'center' });

  return doc;
}

/** Single-attendee name tag — creates a doc, draws, saves. */
export async function generateIdTagPDF(attendee) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'in', format: [PAGE_W, PAGE_H] });
  await drawIdTagOnDoc(doc, attendee);
  const bareName = [attendee.fname, attendee.mname, attendee.lname].filter(Boolean).join(' ');
  const safeName = bareName.replace(/[^a-z0-9]+/gi, '_');
  doc.save(`IDTag_${safeName}_${attendee.ref}.pdf`);
}

/** Bulk name tags — one page per attendee, all saved as a single PDF. */
export async function generateBulkIdTagsPDF(attendees, { onProgress } = {}) {
  if (!attendees.length) return;
  const tpl = await loadTemplate();
  const doc = new jsPDF({ orientation: 'portrait', unit: 'in', format: [PAGE_W, PAGE_H] });
  for (let i = 0; i < attendees.length; i++) {
    if (i > 0) doc.addPage([PAGE_W, PAGE_H], 'portrait');
    await drawIdTagOnDoc(doc, attendees[i], tpl);
    if (onProgress) onProgress(i + 1, attendees.length);
  }
  const stamp = new Date().toISOString().slice(0, 10);
  doc.save(`IBP-NL-NameTags_${stamp}_${attendees.length}pcs.pdf`);
}
