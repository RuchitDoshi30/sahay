import { useAccessibility } from '../context/AccessibilityContext';

export default function SahajToggle() {
  const { sahajMode, toggleSahajMode, language } = useAccessibility();

  const labels = {
    en: { on: '🌿 Sahaj Mode: ON', off: '🌿 Sahaj Mode: OFF' },
    hi: { on: '🌿 सहज मोड: चालू', off: '🌿 सहज मोड: बंद' },
    gu: { on: '🌿 સરળ મોડ: ચાલુ', off: '🌿 સરળ મોડ: બંધ' },
  };

  const currentLabel = labels[language] || labels.en;

  return (
    <button
      type="button"
      onClick={toggleSahajMode}
      title={
        sahajMode
          ? 'Sahaj Mode active: Displays simple grassroots language without complex banking terms'
          : 'Click to enable Sahaj Mode for simpler, grassroots-friendly language'
      }
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 12px',
        borderRadius: '999px',
        border: `1px solid ${sahajMode ? '#86efac' : '#d1d5db'}`,
        background: sahajMode ? '#f0fdf4' : '#f9fafb',
        color: sahajMode ? '#166534' : '#4b5563',
        fontSize: '12px',
        fontWeight: 700,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: sahajMode ? '0 2px 8px rgba(34, 197, 94, 0.15)' : 'none',
      }}
    >
      <span
        style={{
          display: 'inline-block',
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: sahajMode ? '#22c55e' : '#9ca3af',
        }}
      />
      <span>{sahajMode ? currentLabel.on : currentLabel.off}</span>
    </button>
  );
}
