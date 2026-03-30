'use client';

import { useLanguage } from '@/context/LanguageContext';

export default function LanguageToggle() {
  const { lang, toggleLanguage } = useLanguage();

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-white hover:bg-muted transition-colors text-xs font-semibold text-text"
      title={lang === 'en' ? 'हिंदी में बदलें' : 'Switch to English'}
    >
      {lang === 'en' ? (
        <><span className="text-sm">अ</span> हिंदी</>
      ) : (
        <><span className="text-sm">A</span> English</>
      )}
    </button>
  );
}
