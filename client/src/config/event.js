// ──────────────────────────────────────────────────────────────
// Event-wide constants. Update these for your convention.
// ──────────────────────────────────────────────────────────────

export const EVENT_INFO = {
  title: "IBP North Luzon Regional Convention",
  region: "North Luzon Region",
  theme: "Empowering Justice, Embracing Diversity: Amianan Standing in Solidarity, Serving with Inclusivity",
  date: "October 15-17, 2026",
  venue: "CMP Convention Center, Capitol Compound, Bayombong, Nueva Vizcaya",
  email: "contact@email.com",
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
// Special rates (Senior, PWD, New Lawyer 2026) share the same fee.
// Senior + New Lawyer auto-apply from other fields; PWD is chosen manually
// and requires a PWD ID upload.
export const REGISTRATION_TYPES = [
  {
    value: "earlybird",
    label: "Early Bird",
    fee: "₱ 6,500",
    badge: "earlybird",
  },
  { value: "regular",   label: "Regular",                 fee: "₱ 7,500", badge: "regular" },
  { value: "senior",    label: "Senior Citizen",          fee: "₱ 6,500", badge: "senior" },
  { value: "pwd",       label: "PWD",                     fee: "₱ 6,500", badge: "pwd" },
  { value: "newlawyer", label: "Lawyer Admitted in 2026", fee: "₱ 6,500", badge: "newlawyer" },
];

// Categories that qualify as the "Special" ₱6,500 rate — used to show a
// single message on the confirmation and to group them in reports.
export const SPECIAL_RATE_CATEGORIES = ["senior", "pwd", "newlawyer"];

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

// Lawyers admitted THIS calendar year qualify for the new-lawyer discount.
export function isNewLawyerByBarYear(barAdmission) {
  const y = parseInt(barAdmission, 10);
  return Number.isFinite(y) && y === new Date().getFullYear();
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
