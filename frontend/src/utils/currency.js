/**
 * currency.js — Indian currency formatting utilities for the Sahay frontend.
 * All monetary values are in Indian Rupees (INR).
 */

/**
 * Formats a number as Indian Rupee string with locale grouping.
 * Example: formatINR(342000) → "₹3,42,000"
 * @param {number} amount
 * @returns {string}
 */
export function formatINR(amount) {
  if (amount == null || isNaN(amount)) return '—'
  return '₹' + Number(amount).toLocaleString('en-IN')
}

/**
 * Formats a large amount in Lakhs (1 Lakh = 100,000).
 * Example: formatLakhs(5000000) → "₹50.0 Lakhs"
 * @param {number} amount
 * @param {number} decimals — decimal places (default: 1)
 * @returns {string}
 */
export function formatLakhs(amount, decimals = 1) {
  if (amount == null || isNaN(amount)) return '—'
  return `₹${(amount / 100000).toFixed(decimals)} Lakhs`
}

/**
 * Formats a monthly EMI amount with the " / mo" suffix.
 * @param {number} amount
 * @returns {string}
 */
export function formatEMI(amount) {
  if (amount == null || isNaN(amount)) return '—'
  return formatINR(amount) + ' / mo'
}
