/**
 * Disclaimer — DL-007 compliant prototype data transparency badge.
 * Renders the standardized advisory that branch/liquidity data is illustrative
 * and awaiting live CBS/Jan Samarth API integration.
 *
 * Props:
 *   compact {boolean} — Render compact inline badge vs full banner (default: false)
 */
function Disclaimer({ compact = false }) {
  if (compact) {
    return (
      <span
        style={{
          fontSize: '11px',
          color: '#3d7d59',
          background: '#ffffff',
          padding: '3px 8px',
          borderRadius: '4px',
          border: '1px solid #c8e9d6',
        }}
      >
        Prototype Notice: Branch liquidity metrics are illustrative mocks awaiting live CBS/Jan Samarth API sync (DL-007)
      </span>
    )
  }

  return (
    <div
      style={{
        marginBottom: '20px',
        padding: '10px 18px',
        borderRadius: '8px',
        background: '#eff8f3',
        border: '1px solid #c8e9d6',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '10px',
        fontSize: '12px',
        color: '#1a5c38',
      }}
    >
      <div>
        <strong>Geospatial Channel Partner Network:</strong> Filtered by accredited State Channelising Agencies (SCAs) and servicing banks in your district.
      </div>
      <Disclaimer compact />
    </div>
  )
}

export default Disclaimer
