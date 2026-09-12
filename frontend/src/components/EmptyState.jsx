/**
 * EmptyState — Placeholder card when no data is available (e.g. no profile found).
 * Props:
 *   icon      {string}   — Emoji icon (default: '📋')
 *   title     {string}   — Heading text
 *   message   {string}   — Body description
 *   onAction  {function} — Optional CTA callback
 *   actionLabel {string} — CTA button text
 */
function EmptyState({
  icon = '📋',
  title = 'Nothing here yet',
  message,
  onAction,
  actionLabel = 'Get Started',
}) {
  return (
    <div
      className="profile-form-card pl-empty"
      style={{ padding: '50px 30px', textAlign: 'center' }}
    >
      <span style={{ fontSize: '36px' }}>{icon}</span>
      <h3 style={{ margin: '12px 0 8px' }}>{title}</h3>
      {message && (
        <p style={{ color: '#68736d', marginBottom: '18px' }}>{message}</p>
      )}
      {onAction && (
        <button type="button" className="primary-btn" onClick={onAction}>
          {actionLabel} →
        </button>
      )}
    </div>
  )
}

export default EmptyState
