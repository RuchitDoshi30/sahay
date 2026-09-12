/**
 * defaults.js — Default / fallback values for the Sahay application.
 * Used as offline / demo fallbacks when sessionStorage is empty.
 */

/** Canonical demo profile for the Rajkot dairy farmer (Ramesh Parmar) */
export const DEFAULT_PROFILE = {
  annual_income: '300000',
  purpose: 'business',
  project_cost: '380000',
  activity_type: 'dairy',
  state: 'Gujarat',
  district: 'Rajkot',
  has_sc_certificate: 'true',
  latitude: 22.3039,
  longitude: 70.8022,
}

/** GSCDC Rajkot — canonical demo channel partner (from partners.json) */
export const DEFAULT_PARTNER = {
  id: 'GJ-RJK-001',
  name: 'Gujarat Scheduled Castes Development Corporation (GSCDC)',
  type: 'State Channelizing Agency',
  district: 'Rajkot',
  state: 'Gujarat',
  address: 'District Panchayat Compound, Near Collector Office, Rajkot, Gujarat 360001',
  pincode: '360001',
  phone: '0281-2471092',
  email: 'gscdc.rajkot@gujarat.gov.in',
  hours: 'Mon - Fri: 10:30 AM - 05:30 PM (2nd & 4th Sat closed)',
  verified: true,
  latitude: 22.3039,
  longitude: 70.8022,
  distance_km: 0.5,
}

/** Term Loan Scheme — canonical primary NSFDC scheme */
export const DEFAULT_SCHEME = {
  id: 'term_loan',
  name: 'Term Loan Scheme (NSFDC)',
  interest_rate: 8.0,
  max_project_cost: 5000000,
  loan_cap: 4500000,
  loan_percentage: 90,
  tenure_months: 60,
  moratorium_months: 6,
  summary:
    'Core concessional credit scheme by the National Scheduled Castes Finance and Development Corporation (NSFDC) for self-employment & entrepreneurial expansion.',
}

/** Rajkot center coordinates */
export const DEFAULT_LOCATION = {
  latitude: 22.3039,
  longitude: 70.8022,
  zoom: 13,
}
