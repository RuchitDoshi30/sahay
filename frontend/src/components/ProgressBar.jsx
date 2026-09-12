/**
 * ProgressBar — Step progress indicator for the 4-step Sahay citizen journey.
 * Displays completion status across Profile → Result → Partners → Summary.
 *
 * Props:
 *   currentStep {number} — 1-indexed current step (1=Profile, 2=Result, 3=Partners, 4=Summary)
 */
const STEPS = [
  { label: 'Citizen Profile Intake', step: 1 },
  { label: 'Statutory Scheme & Financials', step: 2 },
  { label: 'Channel Partner Discovery', step: 3 },
  { label: 'Consolidated Action Plan', step: 4 },
]

function ProgressBar({ currentStep = 1 }) {
  return (
    <div className="profile-steps">
      {STEPS.map(({ label, step }, idx) => {
        const isDone = step < currentStep
        const isCurrent = step === currentStep

        return (
          <div key={step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div className={`profile-step${isCurrent ? ' current' : ''}`}>
              <div
                className="profile-step-icon"
                style={isDone ? { background: '#e5f0e9', color: 'var(--green)' } : {}}
              >
                {isDone ? '✓' : isCurrent ? '◎' : step}
              </div>
              <div>
                <strong>{label}</strong>
                <span>{isDone ? 'Completed' : isCurrent ? "You're here" : 'Upcoming'}</span>
              </div>
            </div>
            {idx < STEPS.length - 1 && <div className="profile-step-line" />}
          </div>
        )
      })}
    </div>
  )
}

export default ProgressBar
