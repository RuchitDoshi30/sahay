/**
 * distance.js — Haversine geodesic distance utility for the Sahay frontend.
 * Mirrors the logic in backend/utils/distance.py for client-side distance display.
 */

const EARTH_RADIUS_KM = 6371.0

/**
 * Calculates the great-circle distance between two coordinate pairs
 * using the Haversine formula.
 *
 * @param {number} lat1 - Latitude of point A (decimal degrees)
 * @param {number} lon1 - Longitude of point A (decimal degrees)
 * @param {number} lat2 - Latitude of point B (decimal degrees)
 * @param {number} lon2 - Longitude of point B (decimal degrees)
 * @returns {number} Distance in kilometres (rounded to 1 decimal place)
 */
export function haversineDistance(lat1, lon1, lat2, lon2) {
  const toRad = (deg) => (deg * Math.PI) / 180

  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const radLat1 = toRad(lat1)
  const radLat2 = toRad(lat2)

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(radLat1) * Math.cos(radLat2) * Math.sin(dLon / 2) ** 2

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return Math.round(EARTH_RADIUS_KM * c * 10) / 10
}

/**
 * Formats a distance in km for display.
 * @param {number|null} km
 * @returns {string}
 */
export function formatDistance(km) {
  if (km == null || isNaN(km)) return 'Distance unknown'
  if (km < 1) return `${Math.round(km * 1000)} m away`
  return `${km.toFixed(1)} km away`
}
