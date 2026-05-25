import { useI18n } from '../context/I18nContext';
import { Languages } from 'lucide-react';

export default function LanguageSwitcher({ className = '' }) {
  const { locale, setLocale, locales, t } = useI18n();

  return (
    <div className={`relative ${className}`}>
      <label className="sr-only">{t('common.language')}</label>
      <div className="flex items-center gap-1.5">
        <Languages size={16} className="text-gray-400 shrink-0" />
        <select
          value={locale}
          onChange={(e) => setLocale(e.target.value)}
          className="text-xs font-medium bg-transparent border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1.5 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500/40 cursor-pointer"
          aria-label={t('common.language')}
        >
          {locales.map((l) => (
            <option key={l.code} value={l.code}>
              {l.native}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
