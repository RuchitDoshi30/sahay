/**
 * AlternativeSchemeCard — Renders the "No Wrong Door" secondary alternative scheme.
 * Extracted from Result.jsx for clean component separation.
 *
 * Props:
 *   scheme      {object}   — alternative_scheme from recommendation
 *   isActive    {boolean}  — True when this alternative is the currently active scheme
 *   onSelect    {function} — Called when user toggles to this scheme
 */
function AlternativeSchemeCard({ scheme, isActive = false, onSelect }) {
  if (!scheme) return null

  return (
    <div
      className="profile-form-card"
      style={{
        padding: '24px',
        borderColor: '#d0d5dd',
        background: '#fafbfc',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
        <span style={{ background: '#f2f4f7', color: '#344054', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 700 }}>
          "NO WRONG DOOR" SECONDARY ALTERNATIVE
        </span>
        {isActive && <span className="pl-verified">Currently Selected</span>}
      </div>

      <h3 style={{ margin: '0 0 6px', fontSize: '18px' }}>{scheme.name}</h3>

      <p style={{ color: '#68736d', fontSize: '13px', lineHeight: '1.5', margin: '0 0 16px' }}>
        If your application encounters channel partner capacity constraints or processing bottlenecks under the
        primary scheme, this secondary NSFDC scheme provides immediate alternative coverage.
      </p>

      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', fontSize: '13px', color: '#344054', marginBottom: '16px' }}>
        <span>Interest Rate: <strong>{scheme.interest_rate}% p.a.</strong></span>
        <span>•</span>
        <span>Limit: <strong>Up to ₹{(scheme.max_project_cost / 100000).toFixed(1)} Lakhs</strong></span>
        <span>•</span>
        <span>Tenure: <strong>{scheme.tenure_months} Months</strong></span>
      </div>

      {!isActive ? (
        <button
          type="button"
          className="secondary-btn"
          style={{ padding: '8px 16px', fontSize: '12px' }}
          onClick={() => onSelect && onSelect(scheme)}
        >
          Switch Active Scheme to {scheme.name}
        </button>
      ) : (
        <span style={{ fontSize: '12px', color: '#087a4d', fontWeight: 600 }}>
          ✓ Active scheme selected for partner routing
        </span>
      )}
    </div>
  )
}

export default AlternativeSchemeCard
