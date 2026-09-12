/**
 * Sahay API Service Layer
 * Fully conforms to docs/api-contract.md
 */

const API_BASE = '/api';

/**
 * Normalizes form / sessionStorage data into the strict ProfileRequest schema
 * required by POST /api/recommend.
 */
export function normalizeProfile(raw) {
  if (!raw) return null;

  return {
    has_sc_certificate:
      raw.has_sc_certificate === true ||
      raw.has_sc_certificate === 'true' ||
      raw.has_sc_certificate === 'yes' ||
      raw.has_sc_certificate === 1,
    annual_income: parseInt(raw.annual_income, 10) || 0,
    purpose: String(raw.purpose || '').trim().toLowerCase(),
    project_cost: parseInt(raw.project_cost, 10) || 0,
    activity_type: String(raw.activity_type || '').trim().toLowerCase(),
    state: String(raw.state || '').trim(),
    district: String(raw.district || '').trim(),
    latitude: raw.latitude != null ? parseFloat(raw.latitude) : (raw.lat != null ? parseFloat(raw.lat) : undefined),
    longitude: raw.longitude != null ? parseFloat(raw.longitude) : (raw.lon != null ? parseFloat(raw.lon) : undefined),
    gender: raw.gender ? String(raw.gender).trim().toLowerCase() : undefined,
  };
}

/**
 * Evaluates citizen eligibility and returns the primary statutory recommendation,
 * next-best alternative, and RTI-compliant rejection reasoning.
 * 
 * @param {object} profileData 
 * @returns {Promise<object>} RecommendationResponse
 */
export async function getRecommendation(profileData) {
  const payload = normalizeProfile(profileData);
  const response = await fetch(`${API_BASE}/recommend`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData.detail
      ? (typeof errorData.detail === 'string' ? errorData.detail : JSON.stringify(errorData.detail))
      : `HTTP ${response.status}: Failed to get recommendation`;
    throw new Error(message);
  }

  return response.json();
}

/**
 * Computes financial breakdown (possible loan, margin money, monthly EMI)
 * for a specific scheme and project cost.
 * 
 * @param {string} schemeId 
 * @param {number|string} projectCost 
 * @returns {Promise<object>} CalculationResponse
 */
export async function getCalculation(schemeId, projectCost) {
  const payload = {
    scheme_id: schemeId,
    project_cost: parseInt(projectCost, 10),
  };

  const response = await fetch(`${API_BASE}/calculate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData.detail || `HTTP ${response.status}: Failed to calculate loan breakdown`;
    throw new Error(message);
  }

  return response.json();
}

/**
 * Queries channel partners (SCAs, RRBs, Banks) filtered by location & scheme.
 * 
 * @param {object} params
 * @param {string} params.state
 * @param {string} params.district
 * @param {string} params.scheme_id
 * @param {number} [params.lat]
 * @param {number} [params.lon]
 * @returns {Promise<object>} PartnersResponse { partners, total, filter_applied }
 */
export async function getPartners({ state, district, scheme_id, lat, lon }) {
  const query = new URLSearchParams({
    state: state || 'Gujarat',
    district: district || 'Rajkot',
    scheme_id: scheme_id || 'term_loan',
  });

  if (lat != null && !isNaN(lat)) query.append('lat', lat);
  if (lon != null && !isNaN(lon)) query.append('lon', lon);

  const response = await fetch(`${API_BASE}/partners?${query.toString()}`);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData.detail || `HTTP ${response.status}: Failed to fetch channel partners`;
    throw new Error(message);
  }

  return response.json();
}

/**
 * Liveness probe for backend health
 */
export async function checkHealth() {
  const response = await fetch(`${API_BASE}/health`);
  if (!response.ok) throw new Error('Backend unhealthy');
  return response.json();
}
