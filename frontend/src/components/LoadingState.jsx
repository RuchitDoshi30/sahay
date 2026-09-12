/**
 * LoadingState — Full-card loading spinner for async API evaluation states.
 * Props:
 *   message  {string} — Primary heading (default: "Loading...")
 *   detail   {string} — Secondary description line
 */
function LoadingState({ message = 'Loading...', detail }) {
  return (
    <div className="profile-form-card" style={{ padding: '60px 30px', textAlign: 'center' }}>
      <div style={{ fontSize: '32px', marginBottom: '14px', animation: 'spin 1.5s linear infinite' }}>
        ⏳
      </div>
      <h3 style={{ margin: '0 0 8px', fontSize: '18px' }}>{message}</h3>
      {detail && (
        <p style={{ color: '#68736d', fontSize: '14px', margin: 0 }}>{detail}</p>
      )}
    </div>
  )
}

export default LoadingState
