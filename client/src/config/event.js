// ──────────────────────────────────────────────────────────────
// Event-wide constants. Update these for your convention.
// ──────────────────────────────────────────────────────────────

export const EVENT_INFO = {
  title: "IBP North Luzon Regional Convention",
  region: "North Luzon Region",
  theme: "IBP: Empowering Justice, Embracing Diversity",
  themeIl: "IBP: Panangpasiglat iti Hustisya, Panangipateg iti Dadduma",
  date: "October 15-17, 2026",
  venue: "CMP Convention Center",
  regOpen: "[Start Date] – [End Date]",
  deadline: "[Month DD, YYYY]",
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

// Update with the real options once confirmed. `mapsQuery` powers the
// "View on Maps" link for each card.
export const NEARBY_HOTELS = [
  {
    name: "People's Hotel",
    distance: "~1.5 km from venue",
    notes: "Bayombong town proper, walking distance to restaurants.",
    mapsQuery: "People's Hotel Bayombong Nueva Vizcaya",
  },
  {
    name: "Casa de Salvacion",
    distance: "~2 km from venue",
    notes: "Budget-friendly, near the public market.",
    mapsQuery: "Casa de Salvacion Bayombong Nueva Vizcaya",
  },
  {
    name: "La Mont Bleu Hotel",
    distance: "~3 km from venue",
    notes: "Hillside views, on-site restaurant.",
    mapsQuery: "La Mont Bleu Hotel Bayombong Nueva Vizcaya",
  },
  {
    name: "DH Hotel",
    distance: "~4 km from venue",
    notes: "Newer build, family rooms available.",
    mapsQuery: "DH Hotel Bayombong Nueva Vizcaya",
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

export const REGISTRATION_TYPES = [
  {
    value: "earlybird",
    label: "Early Bird",
    fee: "₱ 8,000",
    badge: "earlybird",
  },
  { value: "regular", label: "Regular", fee: "₱ 10,000", badge: "regular" },
  { value: "walkin", label: "Walk-in", fee: "₱ 12,000", badge: "walkin" },
  { value: "senior", label: "Senior Citizen", fee: "₱ 6,400", badge: "senior" },
];

export const CATEGORY_LABELS = REGISTRATION_TYPES.reduce((acc, t) => {
  acc[t.value] = t.label;
  return acc;
}, {});

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
