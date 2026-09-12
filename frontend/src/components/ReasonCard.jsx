/**
 * ReasonCard — RTI & Public Audit Transparency card.
 * Displays the list of schemes evaluated but rejected, with deterministic statutory reasons.
 *
 * Props:
 *   rejectedSchemes {Array<{scheme_name, rejection_reason}>} — from recommendation.rejected_schemes
 */
function ReasonCard({ rejectedSchemes = [] }) {
  if (!rejectedSchemes || rejectedSchemes.length === 0) return null

  return (
    <div className="profile-form-card" style={{ padding: '24px', background: '#ffffff' }}>
      <div style={{ marginBottom: '14px' }}>
        <span className="small-label">RTI &amp; PUBLIC AUDIT TRANSPARENCY</span>
        <h3 style={{ margin: '4px 0 2px', fontSize: '17px' }}>Other NSFDC Schemes Evaluated</h3>
        <p style={{ color: '#68736d', fontSize: '12px', margin: 0 }}>
          Every disqualified government scheme must record a deterministic, legally auditable statutory reason.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {rejectedSchemes.map((item, idx) => (
          <div
            key={idx}
            style={{
              padding: '12px 16px',
              borderRadius: '8px',
              background: '#f8faf9',
              border: '1px solid #eaecf0',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
              <strong style={{ fontSize: '13px', color: '#344054' }}>{item.scheme_name}</strong>
              <span style={{ fontSize: '11px', color: '#b42318', background: '#fef3f2', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                Disqualified
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '12px', color: '#68736d' }}>{item.rejection_reason}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ReasonCard
