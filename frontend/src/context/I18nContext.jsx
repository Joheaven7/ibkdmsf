import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getMessage, LOCALES } from '../i18n';

const STORAGE_KEY = 'ibkdms_locale';
const I18nContext = createContext(null);

export function I18nProvider({ children }) {
  const [locale, setLocaleState] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || 'en';
    } catch {
      return 'en';
    }
  });

  useEffect(() => {
    document.documentElement.lang = locale;
    localStorage.setItem(STORAGE_KEY, locale);
  }, [locale]);

  const setLocale = useCallback((code) => {
    if (LOCALES.some((l) => l.code === code)) setLocaleState(code);
  }, []);

  const t = useCallback((key) => getMessage(locale, key), [locale]);

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, locales: LOCALES }}>
      {children}
    </I18nContext.Provider>
  );
}

export const useI18n = () => useContext(I18nContext);
