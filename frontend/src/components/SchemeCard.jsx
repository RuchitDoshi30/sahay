/**
 * SchemeCard — Renders a single NSFDC scheme recommendation card.
 * Used to display the primary recommended scheme with its key financial terms.
 *
 * Props:
 *   scheme       {object}  — Scheme object from /api/recommend (recommended_scheme or alternative_scheme)
 *   isActive     {boolean} — Whether this is the currently selected scheme
 *   isAlternative {boolean} — True when rendering the "No Wrong Door" alternative
 *   reasons      {string[]} — Array of selection reasons (only for primary scheme)
 *   onSelect     {function} — Called when user clicks to switch to this scheme
 */
function SchemeCard({ scheme, isActive = false, isAlternative = false, reasons = [], onSelect }) {
  if (!scheme) return null

  const chipStyle = isActive && !isAlternative
    ? { background: '#087a4d', color: '#ffffff', fontWeight: 700 }
    : { background: '#f2f4f7', color: '#344054' }

  const label = isAlternative
    ? '"NO WRONG DOOR" SECONDARY ALTERNATIVE'
    : isActive
      ? '✓ RECOMMENDED SCHEME'
      : 'ALTERNATIVE SCHEME'

  return (
    <div
      className="profile-form-card"
      style={{
        borderColor: isActive && !isAlternative ? 'var(--green)' : '#d0d5dd',
        boxShadow: isActive && !isAlternative ? '0 12px 35px rgba(23, 107, 77, 0.12)' : 'none',
        padding: '28px',
        background: isAlternative ? '#fafbfc' : '#ffffff',
      }}
    >
      {/* Header chips */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' }}>
        <span className="pl-scheme-chip" style={chipStyle}>{label}</span>
        {!isAlternative && (
          <span className="pl-scheme-chip" style={{ background: '#e5f0e9', color: 'var(--green-dark)' }}>
            {scheme.loan_percentage}% NSFDC Concessional Loan
          </span>
        )}
        {isAlternative && isActive && <span className="pl-verified">Currently Selected</span>}
      </div>

      {/* Scheme name */}
      <h2 style={{ fontSize: isAlternative ? '18px' : '24px', margin: '0 0 10px', color: 'var(--ink)' }}>
        {scheme.name}
      </h2>

      {/* Key terms */}
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', fontSize: '13px', color: '#344054', marginBottom: '16px' }}>
        <span>Interest: <strong>{scheme.interest_rate}% p.a.</strong></span>
        <span>•</span>
        <span>Limit: <strong>₹{(scheme.max_project_cost / 100000).toFixed(1)} Lakhs</strong></span>
        <span>•</span>
        <span>Tenure: <strong>{scheme.tenure_months} Months</strong></span>
        {scheme.moratorium_months > 0 && (
          <>
            <span>•</span>
            <span>Moratorium: <strong>{scheme.moratorium_months} Months</strong></span>
          </>
        )}
      </div>

      {/* Statutory reasons (primary only) */}
      {reasons.length > 0 && (
        <div style={{ background: '#fbfcfb', padding: '16px 20px', borderRadius: '10px', border: '1px solid #eaecf0', marginBottom: '20px' }}>
          <strong style={{ fontSize: '13px', display: 'block', marginBottom: '10px', color: '#17231d' }}>
            Why this scheme was selected for your profile:
          </strong>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '8px' }}>
            {reasons.map((reason, idx) => (
              <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '13px', color: '#344054' }}>
                <span className="secure-mark" style={{ marginTop: '2px' }}>✓</span>
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Switch action */}
      {onSelect && !isActive && (
        <button
          type="button"
          className="secondary-btn"
          style={{ padding: '8px 16px', fontSize: '12px' }}
          onClick={() => onSelect(scheme)}
        >
          Switch Active Scheme to {scheme.name}
        </button>
      )}
      {isAlternative && isActive && (
        <span style={{ fontSize: '12px', color: '#087a4d', fontWeight: 600 }}>
          ✓ Active scheme selected for partner routing
        </span>
      )}
    </div>
  )
}

export default SchemeCard
