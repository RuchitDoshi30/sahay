/**
 * formatting.js — General display formatting utilities for the Sahay frontend.
 */

/**
 * Capitalizes the first letter of each word in a string.
 * @param {string} str
 * @returns {string}
 */
export function titleCase(str) {
  if (!str) return ''
  return str
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/**
 * Formats an annual income string as a human-readable range label.
 * @param {number|string} income
 * @returns {string}
 */
export function formatIncomeLabel(income) {
  const value = Number(income)
  if (isNaN(value)) return 'Unknown'
  if (value <= 100000) return 'Below ₹1 Lakh'
  if (value <= 300000) return '₹1–3 Lakhs'
  if (value <= 500000) return '₹3–5 Lakhs'
  return 'Above ₹5 Lakhs (Ineligible)'
}

/**
 * Returns a human-readable tenure string.
 * @param {number} months
 * @returns {string}
 */
export function formatTenure(months) {
  if (!months) return '—'
  const years = months / 12
  return `${months} Months (${years} ${years === 1 ? 'Year' : 'Years'})`
}

/**
 * Safely parses JSON from sessionStorage, returning fallback on error.
 * @param {string} key
 * @param {*} fallback
 * @returns {*}
 */
export function getSessionItem(key, fallback = null) {
  try {
    const raw = sessionStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}
