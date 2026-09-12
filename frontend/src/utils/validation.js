/**
 * validation.js — Client-side profile form validation for the Sahay intake form.
 * Mirrors the backend Pydantic validators to give instant feedback.
 */

/**
 * Validates the citizen profile form fields before submitting to /api/recommend.
 *
 * @param {object} formData — Raw form values (all string)
 * @returns {{ isValid: boolean, errors: object }} — errors is a map of field → message
 */
export function validateProfile(formData) {
  const errors = {}

  // SC Certificate
  if (
    formData.has_sc_certificate === '' ||
    formData.has_sc_certificate == null
  ) {
    errors.has_sc_certificate = 'SC Certificate status is required.'
  }

  // Annual income
  const income = parseInt(formData.annual_income, 10)
  if (!formData.annual_income || isNaN(income)) {
    errors.annual_income = 'Annual family income is required.'
  } else if (income <= 0) {
    errors.annual_income = 'Annual income must be a positive value.'
  } else if (income > 500000) {
    errors.annual_income = 'Income exceeds NSFDC eligibility ceiling of ₹5,00,000.'
  }

  // Purpose
  const validPurposes = ['business', 'education']
  if (!formData.purpose) {
    errors.purpose = 'Loan purpose is required.'
  } else if (!validPurposes.includes(formData.purpose.toLowerCase())) {
    errors.purpose = `Purpose must be one of: ${validPurposes.join(', ')}.`
  }

  // Activity type
  if (!formData.activity_type || !formData.activity_type.trim()) {
    errors.activity_type = 'Activity / enterprise type is required.'
  }

  // Project cost
  const cost = parseInt(formData.project_cost, 10)
  if (!formData.project_cost || isNaN(cost)) {
    errors.project_cost = 'Estimated project cost is required.'
  } else if (cost <= 0) {
    errors.project_cost = 'Project cost must be a positive value.'
  }

  // State
  if (!formData.state || !formData.state.trim()) {
    errors.state = 'State is required for partner routing.'
  }

  // District
  if (!formData.district || !formData.district.trim()) {
    errors.district = 'District is required for channel partner discovery.'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}
