import { useState, useRef, useEffect } from 'react';
import { useAccessibility } from '../context/AccessibilityContext';

const LANGUAGES = [
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'hi', label: 'हिन्दी', short: 'HI' },
  { code: 'gu', label: 'ગુજરાતી', short: 'GU' },
  { code: 'mr', label: 'मराठी', short: 'MR' },
  { code: 'ta', label: 'தமிழ்', short: 'TA' },
  { code: 'te', label: 'తెలుగు', short: 'TE' },
  { code: 'bn', label: 'বাংলা', short: 'BN' },
  { code: 'pa', label: 'ਪੰਜਾਬੀ', short: 'PA' },
];

export default function LanguageSelector() {
  const { language, setLanguage } = useAccessibility();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const current = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="language-selector-wrapper notranslate" ref={dropdownRef} style={{ position: 'relative' }}>
      <button
        type="button"
        className="language-selector notranslate"
        aria-label="Select language"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          cursor: 'pointer',
        }}
      >
        <span>{current.short}</span>
        <span style={{ fontSize: '12px' }}>{current.label}</span>
        <span style={{ fontSize: '10px' }}>{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div
          className="language-dropdown-menu notranslate"
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            right: 0,
            background: '#ffffff',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
            zIndex: 1100,
            minWidth: '145px',
            maxHeight: '280px',
            overflowY: 'auto',
            overflowX: 'hidden',
          }}
        >
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              type="button"
              onClick={() => {
                setLanguage(lang.code);
                setIsOpen(false);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                padding: '10px 14px',
                border: 'none',
                background: language === lang.code ? '#f0fdf4' : '#ffffff',
                color: language === lang.code ? '#166534' : '#1f2937',
                fontWeight: language === lang.code ? 700 : 500,
                fontSize: '13px',
                textAlign: 'left',
                cursor: 'pointer',
                borderBottom: '1px solid #f3f4f6',
              }}
            >
              <span>{lang.label}</span>
              {language === lang.code && <span style={{ color: '#16a34a' }}>✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
