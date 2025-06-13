import en from './en.json';
import ko from './ko.json';
import { Locale } from 'antd/es/locale';
import { createInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    'backend.ai-ui': en,
  },
  ko: {
    'backend.ai-ui': ko,
  },
};

export const i18n = createInstance({
  lng: 'en',
  fallbackLng: 'en',
  defaultNS: 'backend.ai-ui',
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

export interface BAILocale {
  lang: string;
  antdLocale: Locale;
}
