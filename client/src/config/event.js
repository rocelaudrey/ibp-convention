// ──────────────────────────────────────────────────────────────
// Event-wide constants. Update these for your convention.
// ──────────────────────────────────────────────────────────────

export const EVENT_INFO = {
  title:    'IBP North Luzon Regional Convention',
  region:   'North Luzon Region',
  theme:    'IBP: Empowering Justice, Embracing Diversity',
  themeIl:  'IBP: Panangpasiglat iti Hustisya, Panangipateg iti Dadduma',
  date:     '[Month DD–DD, YYYY]',
  venue:    '[Venue Name, City/Province]',
  regOpen:  '[Start Date] – [End Date]',
  deadline: '[Month DD, YYYY]',
  email:    'contact@email.com'
};

export const CHAPTERS = [
  'Abra', 'Apayao', 'Batanes', 'Cagayan', 'Ifugao', 'Isabela',
  'Kalinga', 'Mountain Province', 'Nueva Vizcaya', 'Quirino',
  'Aurora', 'Other'
];

export const REGISTRATION_TYPES = [
  { value: 'earlybird', label: 'Early Bird',     fee: '₱ —', badge: 'earlybird' },
  { value: 'regular',   label: 'Regular',        fee: '₱ —', badge: 'regular' },
  { value: 'walkin',    label: 'Walk-in',        fee: '₱ —', badge: 'walkin' },
  { value: 'senior',    label: 'Senior Citizen', fee: '₱ —', badge: 'senior' }
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

// Admin password used by the local-storage mode gate. The server has its own.
export const LOCAL_ADMIN_PASSWORD =
  import.meta.env.VITE_ADMIN_PASSWORD || 'ibpadmin2026';
