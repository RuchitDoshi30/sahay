import { useState, useEffect } from 'react';
import { useAccessibility } from '../context/AccessibilityContext';

export default function AudioNarrator({ text, label, style = {} }) {
  const { language } = useAccessibility();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setSupported(true);
    }
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  if (!supported) return null;

  const handleToggleSpeak = () => {
    if (!text) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel(); // Stop any pending utterances

    const utterance = new SpeechSynthesisUtterance(text);
    const langMap = {
      gu: 'gu-IN',
      hi: 'hi-IN',
      mr: 'mr-IN',
      ta: 'ta-IN',
      te: 'te-IN',
      bn: 'bn-IN',
      pa: 'pa-IN',
      en: 'en-IN',
    };
    utterance.lang = langMap[language] || 'en-IN';
    utterance.rate = 0.95; // Slightly slower for clarity

    // Try finding matched voice if available
    const voices = window.speechSynthesis.getVoices();
    const matchedVoice = voices.find((v) =>
      v.lang.toLowerCase().startsWith(utterance.lang.toLowerCase())
    );
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const currentLabel = { start: '🔊 Listen', stop: '⏹️ Stop' };

  return (
    <button
      type="button"
      onClick={handleToggleSpeak}
      aria-label={isSpeaking ? currentLabel.stop : (label || currentLabel.start)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 12px',
        borderRadius: '8px',
        border: `1px solid ${isSpeaking ? '#ef4444' : '#16a34a'}`,
        background: isSpeaking ? '#fef2f2' : '#f0fdf4',
        color: isSpeaking ? '#dc2626' : '#166534',
        fontSize: '12px',
        fontWeight: 700,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        ...style,
      }}
    >
      <span>{isSpeaking ? currentLabel.stop : (label || currentLabel.start)}</span>
    </button>
  );
}
