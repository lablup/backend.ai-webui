import en from './en.json';
import { Locale } from 'antd/es/locale';
import { createInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: en,
  },
};

export const i18n = createInstance({
  lng: 'en',
  fallbackLng: 'en',
  resources,
  interpolation: {
    escapeValue: false,
  },
  react: {
    transSupportBasicHtmlNodes: true,
    transKeepBasicHtmlNodesFor: ['br', 'strong', 'span', 'code', 'p'],
  },
});

i18n.use(initReactI18next).init();

export interface BUILocale {
  lng: string;
  antdLocale: Locale;
}
