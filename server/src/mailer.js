import nodemailer from 'nodemailer';
import QRCode from 'qrcode';
import { EVENT, CATEGORY_LABELS, CATEGORY_FEE } from './eventInfo.js';

let transporter = null;

export function mailerConfigured() {
  return !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

function getTransport() {
  if (transporter) return transporter;
  if (!mailerConfigured()) return null;
  const port = Number(process.env.SMTP_PORT) || 587;
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465, // 465 = implicit TLS; 587 = STARTTLS
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  return transporter;
}

const peso = (n) => '₱' + Number(n).toLocaleString('en-PH');

function buildHtml(attendee, { typeLabel, feeText }) {
  const displayName = `Atty. ${[attendee.fname, attendee.mname, attendee.lname].filter(Boolean).join(' ')}`;
  return `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;color:#2a1a40;">
    <div style="background:linear-gradient(135deg,#2a1a40,#4c1d95);color:#fff;padding:22px 24px;border-radius:12px 12px 0 0;text-align:center;">
      <div style="font-size:12px;letter-spacing:2px;color:#d6c2ff;text-transform:uppercase;">Integrated Bar of the Philippines</div>
      <div style="font-size:20px;font-weight:bold;margin-top:4px;">${EVENT.title}</div>
    </div>
    <div style="border:1px solid #e5dcf5;border-top:0;border-radius:0 0 12px 12px;padding:24px;">
      <div style="display:inline-block;background:#dcfce7;color:#166534;font-weight:bold;font-size:13px;padding:6px 14px;border-radius:999px;">✓ Payment Verified</div>
      <p style="font-size:15px;line-height:1.6;margin:18px 0 6px;">Dear ${displayName},</p>
      <p style="font-size:15px;line-height:1.6;margin:0 0 18px;">
        We're pleased to confirm that your payment for the <strong>${EVENT.title}</strong> has been verified. Your registration is now complete.
      </p>

      <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:20px;">
        <tr><td style="padding:8px 0;color:#6b5080;">Reference No.</td><td style="padding:8px 0;text-align:right;font-weight:bold;font-family:monospace;">${attendee.ref}</td></tr>
        <tr><td style="padding:8px 0;color:#6b5080;border-top:1px solid #f0eafa;">Registration Type</td><td style="padding:8px 0;text-align:right;border-top:1px solid #f0eafa;">${typeLabel}${feeText ? ' — ' + feeText : ''}</td></tr>
        <tr><td style="padding:8px 0;color:#6b5080;border-top:1px solid #f0eafa;">Chapter</td><td style="padding:8px 0;text-align:right;border-top:1px solid #f0eafa;">${attendee.chapter || '—'}</td></tr>
        <tr><td style="padding:8px 0;color:#6b5080;border-top:1px solid #f0eafa;">Date</td><td style="padding:8px 0;text-align:right;border-top:1px solid #f0eafa;">${EVENT.date}</td></tr>
        <tr><td style="padding:8px 0;color:#6b5080;border-top:1px solid #f0eafa;">Venue</td><td style="padding:8px 0;text-align:right;border-top:1px solid #f0eafa;">${EVENT.venue}</td></tr>
      </table>

      <div style="text-align:center;background:#faf8ff;border:1px solid #ece6f8;border-radius:12px;padding:18px;">
        <div style="font-size:12px;letter-spacing:1.5px;color:#7c3aed;text-transform:uppercase;font-weight:bold;margin-bottom:10px;">Your Check-in QR Code</div>
        <img src="cid:qr@ibpnl" alt="Check-in QR code" width="220" height="220" style="display:block;margin:0 auto;border-radius:8px;" />
        <div style="font-size:12px;color:#8a6fb2;margin-top:10px;">Present this QR at the registration desk on event day. Save or screenshot it.</div>
      </div>

      <p style="font-size:13px;color:#6b5080;line-height:1.6;margin:20px 0 0;">
        For any questions, contact us at <a href="mailto:${EVENT.contactEmail}" style="color:#7c3aed;">${EVENT.contactEmail}</a>.
      </p>
    </div>
    <div style="text-align:center;font-size:11px;color:#a99cc4;padding:14px;">This is an automated message. Please do not reply.</div>
  </div>`;
}

// Sends the "payment verified" confirmation with an embedded QR code.
// Throws on failure so the caller can decide whether to retry.
export async function sendPaymentConfirmation(attendee) {
  const t = getTransport();
  if (!t) throw new Error('SMTP not configured');
  if (!attendee.email) throw new Error('Attendee has no email address');

  const payload = JSON.stringify({
    ref: attendee.ref,
    name: `${attendee.fname} ${attendee.lname}`,
  });
  const qrDataUrl = await QRCode.toDataURL(payload, {
    width: 320, margin: 1, errorCorrectionLevel: 'H',
    color: { dark: '#2a1a40', light: '#ffffff' },
  });
  const qrBuffer = Buffer.from(qrDataUrl.split(',')[1], 'base64');

  const typeLabel = CATEGORY_LABELS[attendee.category] || attendee.category || '';
  const feeNum = CATEGORY_FEE[attendee.category];
  const feeText = feeNum ? peso(feeNum) : '';

  await t.sendMail({
    from: process.env.MAIL_FROM || process.env.SMTP_USER,
    to: attendee.email,
    subject: `Payment Verified — ${EVENT.title}`,
    html: buildHtml(attendee, { typeLabel, feeText }),
    attachments: [{
      filename: `IBP-NL-QR-${attendee.ref}.png`,
      content: qrBuffer,
      cid: 'qr@ibpnl',
    }],
  });
}
