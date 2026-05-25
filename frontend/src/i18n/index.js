import en from './en';
import om from './om';
import am from './am';

export const LOCALES = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'om', label: 'Afaan Oromo', native: 'Afaan Oromoo' },
  { code: 'am', label: 'Amharic', native: 'አማርኛ' },
];

const messages = { en, om, am };

export function getMessage(locale, key) {
  const parts = key.split('.');
  let val = messages[locale] ?? messages.en;
  for (const p of parts) {
    val = val?.[p];
    if (val === undefined) break;
  }
  if (val !== undefined) return val;
  let fallback = messages.en;
  for (const p of parts) {
    fallback = fallback?.[p];
    if (fallback === undefined) return key;
  }
  return fallback ?? key;
}
