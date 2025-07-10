import de from './de.json';
import el from './el.json';
import en from './en.json';
import es from './es.json';
import fi from './fi.json';
import fr from './fr.json';
import id from './id.json';
import it from './it.json';
import ja from './ja.json';
import ko from './ko.json';
import mn from './mn.json';
import ms from './ms.json';
import pl from './pl.json';
import pt_BR from './pt-BR.json';
import pt from './pt.json';
import ru from './ru.json';
import th from './th.json';
import tr from './tr.json';
import vi from './vi.json';
import zh_CN from './zh-CN.json';
import zh_TW from './zh-TW.json';
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
  de: {
    'backend.ai-ui': de,
  },
  el: {
    'backend.ai-ui': el,
  },
  es: {
    'backend.ai-ui': es,
  },
  fi: {
    'backend.ai-ui': fi,
  },
  fr: {
    'backend.ai-ui': fr,
  },
  id: {
    'backend.ai-ui': id,
  },
  it: {
    'backend.ai-ui': it,
  },
  ja: {
    'backend.ai-ui': ja,
  },
  mn: {
    'backend.ai-ui': mn,
  },
  ms: {
    'backend.ai-ui': ms,
  },
  pl: {
    'backend.ai-ui': pl,
  },
  'pt-BR': {
    'backend.ai-ui': pt_BR,
  },
  pt: {
    'backend.ai-ui': pt,
  },
  ru: {
    'backend.ai-ui': ru,
  },
  th: {
    'backend.ai-ui': th,
  },
  tr: {
    'backend.ai-ui': tr,
  },
  vi: {
    'backend.ai-ui': vi,
  },
  'zh-CN': {
    'backend.ai-ui': zh_CN,
  },
  'zh-TW': {
    'backend.ai-ui': zh_TW,
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
