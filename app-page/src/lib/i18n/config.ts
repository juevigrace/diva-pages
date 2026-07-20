import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import es from './locales/es.json';

const resources = { en: { translation: en }, es: { translation: es } };

let initialized = false;

export function initI18n(lang: string = 'en') {
  if (!initialized) {
    i18next.use(initReactI18next).init({
      resources,
      lng: lang,
      fallbackLng: 'en',
      interpolation: { escapeValue: false },
      returnObjects: true,
    });
    initialized = true;
  } else if (i18next.language !== lang) {
    i18next.changeLanguage(lang);
  }
}

export function changeLanguage(lang: string) {
  i18next.changeLanguage(lang);
}
