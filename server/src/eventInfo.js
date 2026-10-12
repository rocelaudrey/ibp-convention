// Event details used in outgoing emails. Kept in sync manually with the
// client's src/config/event.js (no shared module across client/server).

export const EVENT = {
  title: 'IBP Northern Luzon Regional Convention',
  date: 'October 15-17, 2026',
  venue: 'CMP Convention Center, Capitol Compound, Bayombong, Nueva Vizcaya',
  contactEmail: 'ibpnlrc2026admin@gmail.com',
};

export const CATEGORY_LABELS = {
  regular: 'Registration',
  earlybird: 'Early Bird',
  senior: 'Senior Citizen',
  pwd: 'PWD',
  promo: 'Special Promo',
  newlawyer: 'Lawyer Admitted in 2026', // legacy records
};

// Flat ₱4,500 net rate for all delegates (those who paid more are refunded
// the difference after the convention).
export const CATEGORY_FEE = {
  regular: 4500,
  earlybird: 4500,
  senior: 4500,
  pwd: 4500,
  promo: 4500,
  newlawyer: 4500, // legacy records
};
