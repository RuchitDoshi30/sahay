/**
 * ErrorState — Full-card error display for API failures.
 * Props:
 *   title     {string}   — Error heading
 *   message   {string}   — Error detail / body
 *   onAction  {function} — Callback for action button (e.g. Back to Profile)
 *   actionLabel {string} — Button label (default: "Try Again")
 */
function ErrorState({ title = 'Something went wrong', message, onAction, actionLabel = 'Try Again' }) {
  return (
    <div
      className="profile-form-card"
      style={{ padding: '30px', borderColor: '#fda29b', background: '#fef3f2' }}
    >
      <h3 style={{ color: '#b42318', margin: '0 0 8px' }}>{title}</h3>
      {message && (
        <p style={{ color: '#7a271a', margin: '0 0 16px', fontSize: '13px' }}>{message}</p>
      )}
      {onAction && (
        <button type="button" className="primary-btn" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  )
}

export default ErrorState
