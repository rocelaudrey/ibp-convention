import jsPDF from 'jspdf';
import { EVENT_INFO } from '../config/event.js';

export function generateCertificatePDF(attendee) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();   // 297
  const H = doc.internal.pageSize.getHeight();  // 210

  // Background tint
  doc.setFillColor(252, 250, 255);
  doc.rect(0, 0, W, H, 'F');

  // Outer + inner borders
  doc.setDrawColor(76, 29, 149); doc.setLineWidth(1.4);
  doc.rect(8, 8, W - 16, H - 16);
  doc.setDrawColor(155, 126, 212); doc.setLineWidth(0.4);
  doc.rect(12, 12, W - 24, H - 24);

  // Corner ornaments
  doc.setFillColor(124, 58, 237);
  [[18, 18], [W - 18, 18], [18, H - 18], [W - 18, H - 18]]
    .forEach(([x, y]) => doc.circle(x, y, 1.4, 'F'));

  // Top eyebrow
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10);
  doc.setTextColor(124, 58, 237);
  doc.text('INTEGRATED BAR OF THE PHILIPPINES', W / 2, 32, { align: 'center' });

  doc.setFontSize(8.5); doc.setTextColor(140, 110, 180);
  doc.text(EVENT_INFO.region.toUpperCase(), W / 2, 38, { align: 'center' });

  doc.setDrawColor(124, 58, 237); doc.setLineWidth(0.5);
  doc.line(W / 2 - 22, 42, W / 2 + 22, 42);

  // Main title
  doc.setFont('times', 'bold'); doc.setFontSize(38);
  doc.setTextColor(42, 26, 64);
  doc.text('Certificate of Attendance', W / 2, 60, { align: 'center' });

  // "This is to certify that"
  doc.setFont('helvetica', 'normal'); doc.setFontSize(13);
  doc.setTextColor(90, 64, 112);
  doc.text('This is to certify that', W / 2, 78, { align: 'center' });

  // Recipient name
  const fullName = [attendee.fname, attendee.mname, attendee.lname].filter(Boolean).join(' ');
  doc.setFont('times', 'bolditalic'); doc.setFontSize(34);
  doc.setTextColor(76, 29, 149);
  doc.text(fullName, W / 2, 100, { align: 'center' });

  // Underline
  doc.setDrawColor(180, 130, 255); doc.setLineWidth(0.4);
  const nameWidth = doc.getTextWidth(fullName);
  doc.line(W / 2 - Math.max(nameWidth / 2, 50), 104, W / 2 + Math.max(nameWidth / 2, 50), 104);

  // Body
  doc.setFont('helvetica', 'normal'); doc.setFontSize(12);
  doc.setTextColor(80, 56, 100);
  doc.text(`has actively participated in the ${EVENT_INFO.title}`, W / 2, 120, { align: 'center' });
  doc.text(`held on ${EVENT_INFO.date} at ${EVENT_INFO.venue}.`, W / 2, 128, { align: 'center' });

  // Theme
  doc.setFont('times', 'italic'); doc.setFontSize(11);
  doc.setTextColor(124, 58, 237);
  doc.text(`"${EVENT_INFO.theme}"`, W / 2, 142, { align: 'center' });

  // Issued date
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10);
  doc.setTextColor(120, 100, 150);
  const issuedOn = new Date().toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' });
  doc.text(`Issued on ${issuedOn}`, W / 2, 152, { align: 'center' });

  // Signatures
  const sigY = H - 38;
  doc.setDrawColor(120, 100, 150); doc.setLineWidth(0.4);
  doc.line(45, sigY, 105, sigY);
  doc.line(W - 105, sigY, W - 45, sigY);

  doc.setFont('helvetica', 'bold'); doc.setFontSize(10);
  doc.setTextColor(60, 40, 90);
  doc.text('Regional Governor', 75, sigY + 6, { align: 'center' });
  doc.text('Convention Chairperson', W - 75, sigY + 6, { align: 'center' });

  doc.setFont('helvetica', 'normal'); doc.setFontSize(8);
  doc.setTextColor(140, 110, 180);
  doc.text('IBP North Luzon Region', 75, sigY + 11, { align: 'center' });
  doc.text('IBP North Luzon Region', W - 75, sigY + 11, { align: 'center' });

  // Ref
  doc.setFontSize(8); doc.setTextColor(155, 126, 212);
  doc.text(`Ref: ${attendee.ref}`, W / 2, H - 14, { align: 'center' });

  const safeName = fullName.replace(/[^a-z0-9]+/gi, '_');
  doc.save(`Certificate_${safeName}_${attendee.ref}.pdf`);
}
