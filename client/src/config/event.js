// ──────────────────────────────────────────────────────────────
// Event-wide constants. Update these for your convention.
// ──────────────────────────────────────────────────────────────

// Maintenance mode: when true, the public registration page shows an
// "unavailable" notice instead of the form. The admin panel stays usable.
// Flip to false and redeploy to bring registration back online.
export const MAINTENANCE_MODE = false;

export const EVENT_INFO = {
  title: "IBP Northern Luzon Regional Convention",
  region: "Northern Luzon Region",
  theme:
    "Empowering Justice, Embracing Diversity: Amianan Standing in Solidarity, Serving with Inclusivity",
  date: "October 15-17, 2026",
  venue: "CMP Convention Center, Capitol Compound, Bayombong, Nueva Vizcaya",
  email: "ibpnlrc2026admin@gmail.com",
};

// ── Venue + nearby hotels ─────────────────────────────────────
// `mapsQuery` is the search string passed to Google Maps. Tweak it
// to refine the pin or open a different result.
export const VENUE_LOCATION = {
  name: "CMP Convention Center",
  address: "Bayombong, Nueva Vizcaya",
  mapsQuery: "CMP Convention Center Bayombong Nueva Vizcaya",
};

// `mapsQuery` powers the "View on Maps" link for each card.
export const NEARBY_HOTELS = [
  {
    name: "Zen Hotel Bayombong",
    distance: "Bayombong town proper",
    notes: "Central location near restaurants and the public market.",
    mapsQuery: "Zen Hotel Bayombong Nueva Vizcaya",
  },
  {
    name: "Disadeco Hotel — Resort & Events Center",
    distance: "Bayombong outskirts",
    notes: "Resort-style with pool, family rooms available.",
    mapsQuery: "Disadeco Hotel Resort Events Center Bayombong Nueva Vizcaya",
  },
  {
    name: "Saber Inn",
    distance: "Bayombong town proper",
    notes: "Quiet inn, book early during convention week.",
    mapsQuery: "Saber Inn Bayombong Nueva Vizcaya",
  },
  {
    name: "24/7 Hotel",
    distance: "Bayombong town proper",
    notes: "Round-the-clock front desk — good for late arrivals.",
    mapsQuery: "24/7 Hotel Bayombong Nueva Vizcaya",
  },
];

export const CHAPTERS = [
  "Abra",
  "Apayao",
  "Baguio-Benguet",
  "Batanes",
  "Cagayan",
  "Ifugao",
  "Ilocos Norte",
  "Ilocos Sur",
  "Isabela",
  "Kalinga",
  "La Union",
  "Mountain Province",
  "Nueva Vizcaya",
  "Quirino",
  "Other",
];

// ── Registration rates ────────────────────────────────────────
// Senior auto-applies from the birthday. PWD and the ₱4,500 Special Promo
// are chosen manually and each require a supporting document upload.
export const REGISTRATION_TYPES = [
  {
    value: "earlybird",
    label: "Early Bird",
    fee: "₱ 6,000",
    badge: "earlybird",
  },
  { value: "regular", label: "Regular", fee: "₱ 7,000", badge: "regular" },
  { value: "senior", label: "Senior Citizen", fee: "₱ 6,000", badge: "senior" },
  { value: "pwd", label: "PWD", fee: "₱ 6,000", badge: "pwd" },
  {
    value: "promo",
    label: "Special Promo – Newly Admitted / Gov't Lawyer",
    fee: "₱ 4,500",
    badge: "promo",
  },
];

// Categories that qualify as a discounted rate — used to group them in reports.
export const SPECIAL_RATE_CATEGORIES = ["senior", "pwd", "promo"];

// ── Special Promo (₱4,500) — Newly Admitted & Government Lawyers ──
// Individual rate (no pairing). New registrants pick it + upload a
// verification document. Already-paid delegates claim a walk-in refund.
export const PROMO = {
  value: "promo",
  feeNum: 4500,
  categories: [
    {
      code: "A",
      label: "Newly Admitted Lawyer",
      hint: "Signed the Roll of Attorneys in CY 2025 or 2026 (incl. 2025 bar passers).",
      docs: [
        "Roll of Attorneys page showing your signature and 2025/2026 admission date",
        "SC Certificate of Admission to the Bar / Oath-Taking Certificate (2025 or 2026)",
        "Valid IBP ID explicitly showing admission year 2025 or 2026",
      ],
    },
    {
      code: "B",
      label: "Government Lawyer",
      hint: "Full-time, plantilla, or contractual in any Philippine government branch, agency, LGU, GOCC, SUC, PAO, NPS, etc.",
      docs: [
        "Valid Government Agency / Judicial ID issued for CY 2026",
        "Certificate of Employment (COE) or certified true copy of Appointment Paper issued within CY 2026",
      ],
    },
  ],
  // Refund due to already-paid qualified delegates (claimed walk-in).
  refund: { earlybird: 1500, regular: 2500 },
  // Downloadable guidelines + reimbursement form hosted in public/.
  formUrl: "/IBP-NLRC-Special-Promo-Guidelines.docx",
  reimburseDeadlineLabel: "the Finance Desk during on-site check-in (October 15–16, 2026)",
};

// ── Early Bird promo window ───────────────────────────────────
// The Early Bird rate is selectable only within this inclusive date
// range (local calendar date). Outside it, the option is disabled.
export const EARLYBIRD_WINDOW = {
  start: "2026-07-12", // YYYY-MM-DD, inclusive
  end: "2026-09-15",   // YYYY-MM-DD, inclusive (extended: Aug 13 → Aug 31 → Sep 15)
  label: "July 12 – September 15, 2026",
  startLabel: "July 12, 2026",
  endLabel: "September 15, 2026",
  extended: true, // show an "extended" emphasis in the countdown banner
};

// Local calendar date as YYYY-MM-DD (avoids UTC off-by-one from toISOString).
function localDateISO(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// True while the Early Bird promo is open. ISO date strings compare
// lexicographically, so plain <= works for the inclusive bounds.
export function isEarlyBirdOpen(now = new Date()) {
  const today = localDateISO(now);
  return today >= EARLYBIRD_WINDOW.start && today <= EARLYBIRD_WINDOW.end;
}

export const CATEGORY_LABELS = REGISTRATION_TYPES.reduce((acc, t) => {
  acc[t.value] = t.label;
  return acc;
}, {});

// Fee (in ₱) as a number, keyed by category. Derived from REGISTRATION_TYPES
// so the Reports page can compute revenue without re-parsing the label.
export const CATEGORY_FEE = REGISTRATION_TYPES.reduce((acc, t) => {
  const n = Number(String(t.fee).replace(/[^0-9.]/g, ""));
  acc[t.value] = Number.isFinite(n) ? n : 0;
  return acc;
}, {});

// ── Bar-anniversary awards ────────────────────────────────────
// Years since admission that qualify for a milestone recognition. Add or
// remove numbers as the committee decides; the Reports page picks them up.
export const BAR_MILESTONES = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50];

export function yearsSinceBar(barAdmission) {
  const y = parseInt(barAdmission, 10);
  if (!Number.isFinite(y)) return null;
  return new Date().getFullYear() - y;
}


// ── Senior citizen detection ──────────────────────────────────
// RA 9994: senior status applies the calendar year a person turns 60,
// regardless of whether their birthday has already passed.
// e.g. born 1966, current year 2026 → turns 60 in 2026 → qualifies now.
export const SENIOR_AGE = 60;

export function ageThisYear(birthday) {
  if (!birthday) return null;
  const d = new Date(birthday);
  if (isNaN(d.getTime())) return null;
  return new Date().getFullYear() - d.getFullYear();
}

export function isSeniorByBirthday(birthday) {
  const age = ageThisYear(birthday);
  return age != null && age >= SENIOR_AGE;
}
