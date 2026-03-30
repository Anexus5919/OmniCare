'use client';

import { createContext, useContext, useState, useCallback } from 'react';
import { translations } from '@/data/translations';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('en');

  const t = useCallback((key) => {
    return translations[lang]?.[key] || translations.en?.[key] || key;
  }, [lang]);

  const toggleLanguage = useCallback(() => {
    setLang(prev => (prev === 'en' ? 'hi' : 'en'));
  }, []);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
