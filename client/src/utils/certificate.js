import jsPDF from 'jspdf';

// ──────────────────────────────────────────────────────────────
// Certificate built on the designed template image
// (public/cert-template.jpg). The template carries all the artwork and
// fixed text (header, body, signature); we overlay only the registrant's
// name — in ALL CAPS — in the blank band above the ornamental divider.
// ──────────────────────────────────────────────────────────────

const TEMPLATE_URL = '/cert-template.jpg';

// A4 landscape (matches the template's 2000×1414 ≈ 1.414 ratio).
const PAGE_W = 297; // mm
const PAGE_H = 210; // mm

// Name placement as fractions of the page (measured from the template).
const NAME_CX = 0.420;   // content-area horizontal center (matches title)
const NAME_Y  = 0.466;   // baseline, in the blank band above the divider
const NAME_MAX_W = 0.60; // max text width as a fraction of page width

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

function fitFontSize(doc, text, maxWidth, startSize, minSize = 10) {
  let size = startSize;
  doc.setFontSize(size);
  while (doc.getTextWidth(text) > maxWidth && size > minSize) {
    size -= 0.5;
    doc.setFontSize(size);
  }
  return size;
}

/**
 * Draws one certificate on the CURRENT page of the given jsPDF instance.
 * `templateData` is the shared template data URL (pass once for bulk).
 */
export async function drawCertificateOnDoc(doc, attendee, templateData) {
  const tpl = templateData || (await loadTemplate());
  doc.addImage(tpl, 'JPEG', 0, 0, PAGE_W, PAGE_H, 'cert-tpl', 'FAST');

  // Registrant name — ALL CAPS, with the Atty. courtesy title.
  const bareName = [attendee.fname, attendee.mname, attendee.lname].filter(Boolean).join(' ');
  const displayName = `ATTY. ${bareName}`.toUpperCase();

  doc.setFont('times', 'bold');
  doc.setTextColor(76, 29, 149);
  fitFontSize(doc, displayName, PAGE_W * NAME_MAX_W, 40);
  doc.text(displayName, PAGE_W * NAME_CX, PAGE_H * NAME_Y, { align: 'center' });

  return doc;
}

/** Single-attendee certificate — creates a doc, draws, saves. */
export async function generateCertificatePDF(attendee) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  await drawCertificateOnDoc(doc, attendee);
  const bareName = [attendee.fname, attendee.mname, attendee.lname].filter(Boolean).join(' ');
  const safeName = bareName.replace(/[^a-z0-9]+/gi, '_');
  doc.save(`Certificate_${safeName}_${attendee.ref}.pdf`);
}

/** Bulk certificates — one landscape A4 page per attendee. */
export async function generateBulkCertificatesPDF(attendees, { onProgress } = {}) {
  if (!attendees.length) return;
  const tpl = await loadTemplate();
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  for (let i = 0; i < attendees.length; i++) {
    if (i > 0) doc.addPage('a4', 'landscape');
    await drawCertificateOnDoc(doc, attendees[i], tpl);
    if (onProgress) onProgress(i + 1, attendees.length);
  }
  const stamp = new Date().toISOString().slice(0, 10);
  doc.save(`IBP-NL-Certificates_${stamp}_${attendees.length}pcs.pdf`);
}
