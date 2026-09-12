/**
 * labels.js — UI display labels and copy strings for NSFDC scheme IDs,
 * activity types, and purpose keys used throughout the Sahay frontend.
 */

/** Human-readable scheme names by scheme ID (mirrors backend SCHEMES dict) */
export const SCHEME_LABELS = {
  term_loan: 'Term Loan Scheme (NSFDC)',
  micro_finance: 'Micro Finance Scheme (NSFDC)',
  udyam_nidhi: 'Udyam Nidhi Scheme (NSFDC)',
  educational_loan: 'Educational Loan Scheme (NSFDC)',
}

/** Human-readable purpose labels */
export const PURPOSE_LABELS = {
  business: 'Business / Entrepreneurship',
  education: 'Education',
}

/** Human-readable partner type labels */
export const PARTNER_TYPE_LABELS = {
  SCA: 'State Channelising Agency',
  RRB: 'Regional Rural Bank',
  BANK: 'Nationalized Bank',
  NBFC: 'Non-Banking Financial Company',
}

/** Step labels for the 4-step citizen journey */
export const STEP_LABELS = {
  1: 'Citizen Profile Intake',
  2: 'Statutory Scheme & Financials',
  3: 'Channel Partner Discovery',
  4: 'Consolidated Action Plan',
}
