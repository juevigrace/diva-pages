import en from './locales/en.json';
import es from './locales/es.json';

const locales: Record<string, Record<string, any>> = { en, es };

function resolvePath(obj: Record<string, any>, path: string): string {
  const keys = path.split('.');
  let current = obj;
  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key];
    } else {
      return path;
    }
  }
  return typeof current === 'string' ? current : path;
}

export function t(key: string, lang: string = 'en'): string {
  const locale = locales[lang] || locales.en;
  return resolvePath(locale, key);
}
