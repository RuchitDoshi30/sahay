/**
 * CalculationCard — Renders the indicative financial repayment schedule
 * returned by POST /api/calculate.
 *
 * Props:
 *   calculation {object}  — CalculationResponse from /api/calculate
 *   isLoading   {boolean} — True while recalculating for scheme switch
 */
function CalculationCard({ calculation, isLoading = false }) {
  if (!calculation && !isLoading) return null

  return (
    <div className="profile-form-card" style={{ padding: '28px', background: '#ffffff' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <span className="small-label">FINANCIAL ESTIMATION</span>
          <h3 style={{ margin: '4px 0 0', fontSize: '19px' }}>Indicative Repayment &amp; Margin Breakdown</h3>
        </div>
        {calculation && (
          <span className="pl-verified">
            {calculation.loan_percentage}% Loan • {100 - calculation.loan_percentage}% Margin
          </span>
        )}
      </div>

      {isLoading ? (
        <div style={{ padding: '30px', textAlign: 'center', color: '#68736d' }}>
          Recalculating amortization schedule...
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '20px' }}>
            <div style={{ padding: '16px', background: '#f8faf9', borderRadius: '8px', border: '1px solid #eef2f0' }}>
              <span style={{ fontSize: '11px', color: '#68736d', textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Total Project Cost</span>
              <strong style={{ fontSize: '20px', color: 'var(--ink)' }}>
                ₹{calculation.project_cost.toLocaleString('en-IN')}
              </strong>
            </div>
            <div style={{ padding: '16px', background: '#eef8f2', borderRadius: '8px', border: '1px solid #c9ebd7' }}>
              <span style={{ fontSize: '11px', color: '#087a4d', textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                Sanctionable Loan ({calculation.loan_percentage}%)
              </span>
              <strong style={{ fontSize: '20px', color: '#087a4d' }}>
                ₹{calculation.possible_loan.toLocaleString('en-IN')}
              </strong>
            </div>
            <div style={{ padding: '16px', background: '#fff9eb', borderRadius: '8px', border: '1px solid #fde68a' }}>
              <span style={{ fontSize: '11px', color: '#b45309', textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Own Margin Contribution</span>
              <strong style={{ fontSize: '20px', color: '#b45309' }}>
                ₹{calculation.own_contribution.toLocaleString('en-IN')}
              </strong>
            </div>
            <div style={{ padding: '16px', background: '#f0f9ff', borderRadius: '8px', border: '1px solid #bae6fd' }}>
              <span style={{ fontSize: '11px', color: '#0369a1', textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Estimated Monthly EMI</span>
              <strong style={{ fontSize: '20px', color: '#0369a1' }}>
                ₹{calculation.monthly_estimate.toLocaleString('en-IN')}
                <span style={{ fontSize: '12px', fontWeight: 'normal', color: '#68736d' }}> / mo</span>
              </strong>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 18px', background: '#f8faf9', borderRadius: '8px', fontSize: '12px', color: '#48554d', flexWrap: 'wrap', gap: '8px' }}>
            <span>Total Repayable: <strong>₹{calculation.total_repayable.toLocaleString('en-IN')}</strong></span>
            <span>Interest Rate: <strong>{calculation.interest_rate}% p.a.</strong></span>
            <span>Moratorium Period: <strong>{calculation.moratorium_months} Months</strong></span>
          </div>

          {calculation.note && (
            <p style={{ color: '#68736d', fontSize: '11px', marginTop: '12px', marginBottom: 0, fontStyle: 'italic' }}>
              ℹ {calculation.note}
            </p>
          )}
        </>
      )}
    </div>
  )
}

export default CalculationCard
