/**
 * FormField — Labeled input field with optional helper text.
 * Used in Profile.jsx and other form pages for consistent form styling.
 *
 * Props:
 *   id          {string}   — Input id (required for a11y label association)
 *   label       {string}   — Field label text
 *   helpText    {string}   — Optional description below the label
 *   fieldNumber {number}   — Step number shown in the field-number badge
 *   children    {ReactNode} — The actual input/select/textarea element
 *   required    {boolean}  — Show required indicator
 */
function FormField({ id, label, helpText, fieldNumber, children, required = false }) {
  return (
    <div className="form-section">
      {fieldNumber != null && (
        <div className="field-number">{String(fieldNumber).padStart(2, '0')}</div>
      )}
      <div className="field-content">
        <label htmlFor={id}>
          {label}
          {required && <span style={{ color: '#d92d20', marginLeft: '4px' }}>*</span>}
        </label>
        {helpText && <p className="field-help">{helpText}</p>}
        {children}
      </div>
    </div>
  )
}

export default FormField
