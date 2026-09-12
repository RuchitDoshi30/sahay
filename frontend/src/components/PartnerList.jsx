/**
 * PartnerList — Scrollable list of channel partners.
 * Renders a list of PartnerCard components from the /api/partners response.
 *
 * Props:
 *   partners         {Array}    — List of partner objects
 *   selectedPartnerId {string}  — ID of the currently selected partner
 *   onSelect         {function} — Callback when a partner is selected
 */
import PartnerCard from './PartnerCard'

function PartnerList({ partners = [], selectedPartnerId, onSelect }) {
  if (!partners || partners.length === 0) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#68736d', fontSize: '13px' }}>
        No channel partners found for this district and scheme.
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {partners.map((partner) => (
        <PartnerCard
          key={partner.id || partner.name}
          partner={partner}
          isSelected={selectedPartnerId === partner.id}
          onSelect={onSelect}
        />
      ))}
    </div>
  )
}

export default PartnerList
