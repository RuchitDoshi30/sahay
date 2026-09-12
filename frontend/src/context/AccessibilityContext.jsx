import { createContext, useContext, useState, useEffect } from 'react';
import { TRANSLATIONS } from '../i18n/translations';

const AccessibilityContext = createContext(null);

function setGoogleTranslateCookie(lang) {
  try {
    const domain = window.location.hostname;
    if (lang === 'en') {
      document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${domain};`;
      if (domain.includes('.')) {
        document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${domain};`;
      }
    } else {
      const cookieVal = `/en/${lang}`;
      document.cookie = `googtrans=${cookieVal}; path=/;`;
      document.cookie = `googtrans=${cookieVal}; path=/; domain=${domain};`;
      if (domain.includes('.')) {
        document.cookie = `googtrans=${cookieVal}; path=/; domain=.${domain};`;
      }
    }
  } catch (e) {
    console.warn('Could not set googtrans cookie:', e);
  }
}

function triggerGoogleTranslateDOM(lang) {
  setGoogleTranslateCookie(lang);

  let attempts = 0;
  const maxAttempts = 25;
  const interval = setInterval(() => {
    attempts++;
    const combo = document.querySelector('.goog-te-combo');
    if (combo) {
      if (combo.value !== lang) {
        combo.value = lang;
        combo.dispatchEvent(new Event('change'));
      }
      clearInterval(interval);
    } else if (attempts >= maxAttempts) {
      clearInterval(interval);
    }
  }, 120);
}

export function AccessibilityProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem('sahay_language') || 'en';
  });

  const [sahajMode, setSahajModeState] = useState(() => {
    const saved = localStorage.getItem('sahay_sahaj_mode');
    return saved !== null ? saved === 'true' : true; // Default to true (Sahaj mode enabled for grassroots citizens)
  });

  // Apply dynamic translation on mount if non-English
  useEffect(() => {
    const saved = localStorage.getItem('sahay_language') || 'en';
    if (saved && saved !== 'en') {
      triggerGoogleTranslateDOM(saved);
    }
  }, []);

  const setLanguage = (lang) => {
    setLanguageState(lang);
    localStorage.setItem('sahay_language', lang);
    triggerGoogleTranslateDOM(lang);
  };

  const toggleSahajMode = () => {
    setSahajModeState((prev) => {
      const next = !prev;
      localStorage.setItem('sahay_sahaj_mode', String(next));
      return next;
    });
  };

  // Translation lookup helper (Dynamic Google Translate handles DOM multi-lingual translation automatically)
  const t = (key) => {
    if (TRANSLATIONS.en && TRANSLATIONS.en[key] !== undefined) {
      return TRANSLATIONS.en[key];
    }
    return key;
  };

  // Plain-language or standard term lookup
  const tTerm = (standardKey, sahajKey) => {
    if (sahajMode && sahajKey) {
      return t(sahajKey);
    }
    return t(standardKey);
  };

  return (
    <AccessibilityContext.Provider
      value={{
        language,
        setLanguage,
        sahajMode,
        toggleSahajMode,
        t,
        tTerm,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    // Graceful fallback if used outside provider
    return {
      language: 'en',
      setLanguage: () => {},
      sahajMode: false,
      toggleSahajMode: () => {},
      t: (key) => key,
      tTerm: (std) => std,
    };
  }
  return context;
}
