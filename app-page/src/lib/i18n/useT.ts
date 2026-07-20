import { initI18n } from './config';
import { useTranslation } from 'react-i18next';

export function useT(lang: string) {
  initI18n(lang);
  return useTranslation().t;
}
