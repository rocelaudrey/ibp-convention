// ──────────────────────────────────────────────────────────────
// Event-wide constants. Update these for your convention.
// ──────────────────────────────────────────────────────────────

// Maintenance mode: when true, the public registration page shows an
// "unavailable" notice instead of the form. The admin panel stays usable.
// Flip to false and redeploy to bring registration back online.
export const MAINTENANCE_MODE = true;

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

// ── Registration rate ─────────────────────────────────────────
// Flat ₱4,500 for all delegates — no registration-type selection and no
// eligibility. Delegates who already paid ₱6,000/₱7,000 get refunds after
// the convention (see PROMO.refund below, shown in the announcement).
export const STANDARD_CATEGORY = "regular";
export const STANDARD_FEE = "₱ 4,500";
export const STANDARD_FEE_NUM = 4500;

export const REGISTRATION_TYPES = [
  { value: "regular", label: "Registration", fee: STANDARD_FEE, badge: "regular" },
];

// Display labels for every category, including legacy records created under
// the old tiered pricing (so the admin table / CSV still read sensibly).
export const CATEGORY_LABELS = {
  regular: "Registration",
  earlybird: "Early Bird",
  senior: "Senior Citizen",
  pwd: "PWD",
  promo: "Special Promo",
  newlawyer: "Lawyer Admitted in 2026",
  walkin: "Walk-in",
};

// Net fee per category. Everyone's net rate is ₱4,500 (those who paid more
// are refunded the difference after the convention).
export const CATEGORY_FEE = {
  regular: 4500, earlybird: 4500, senior: 4500, pwd: 4500,
  promo: 4500, newlawyer: 4500, walkin: 4500,
};

// Refund amounts for delegates who already paid at the old rates — rolled
// out AFTER the convention. Shown in the registration-page announcement.
export const PROMO = {
  refund: { earlybird: 1500, regular: 2500 },
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
