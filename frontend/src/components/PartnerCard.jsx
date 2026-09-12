/**
 * PartnerCard — Renders a single channel partner in the sidebar partner list.
 * Used within PartnerList to display SCA/Bank partner details.
 *
 * Props:
 *   partner    {object}   — Partner object from /api/partners
 *   isSelected {boolean}  — Whether this partner is currently selected
 *   onSelect   {function} — Called when user clicks to select this partner
 */
function PartnerCard({ partner, isSelected = false, onSelect }) {
  if (!partner) return null

  return (
    <div
      onClick={() => onSelect && onSelect(partner)}
      style={{
        padding: '14px 16px',
        borderRadius: '10px',
        border: `1px solid ${isSelected ? 'var(--green)' : '#eaecf0'}`,
        background: isSelected ? '#f4faf6' : '#ffffff',
        cursor: 'pointer',
        transition: 'border-color 0.2s, background 0.2s',
        marginBottom: '8px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
        <div style={{ minWidth: 0 }}>
          <strong style={{ fontSize: '13px', color: 'var(--ink)', display: 'block' }}>{partner.name}</strong>
          <span style={{ fontSize: '11px', color: '#68736d', display: 'block', marginTop: '2px' }}>
            {partner.type || 'Channel Partner'} • {partner.district}, {partner.state}
          </span>
          {partner.distance_km != null && (
            <span style={{ fontSize: '11px', color: '#087a4d', fontWeight: 600, display: 'block', marginTop: '4px' }}>
              📍 {partner.distance_km} km away
            </span>
          )}
          {partner.fund_available !== false && partner.no_overdues !== false ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: '#15803d', background: '#dcfce7', padding: '2px 6px', borderRadius: '4px', fontWeight: 700, marginTop: '5px' }}>
              ✓ Active Quota {partner.npa_percentage != null ? `• ${partner.npa_percentage}% NPA` : ''}
            </span>
          ) : (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: '#b91c1c', background: '#fee2e2', padding: '2px 6px', borderRadius: '4px', fontWeight: 700, marginTop: '5px' }}>
              ⚠️ Disqualified Branch
            </span>
          )}
        </div>
        {isSelected && (
          <span style={{ fontSize: '10px', color: '#087a4d', background: '#e5f0e9', padding: '2px 8px', borderRadius: '4px', fontWeight: 700, flexShrink: 0 }}>
            ✓ Selected
          </span>
        )}
      </div>
    </div>
  )
}

export default PartnerCard
