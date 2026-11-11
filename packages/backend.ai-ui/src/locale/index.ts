import en from './en.json';
import {
  createInstance,
  type BackendModule,
  type i18n as I18nInstance,
} from 'i18next';
import { initReactI18next } from 'react-i18next';

const NAMESPACE = 'backend.ai-ui';

type Catalog = { default: Record<string, unknown> };

// Only `en` is bundled; every other language is its own lazy chunk.
// Specifiers must stay literal so Vite/Rollup can split them.
const catalogLoaders: Record<string, () => Promise<Catalog>> = {
  de: () => import('./de.json'),
  el: () => import('./el.json'),
  es: () => import('./es.json'),
  fi: () => import('./fi.json'),
  fr: () => import('./fr.json'),
  id: () => import('./id.json'),
  it: () => import('./it.json'),
  ja: () => import('./ja.json'),
  ko: () => import('./ko.json'),
  mn: () => import('./mn.json'),
  ms: () => import('./ms.json'),
  pl: () => import('./pl.json'),
  'pt-BR': () => import('./pt-BR.json'),
  pt: () => import('./pt.json'),
  ru: () => import('./ru.json'),
  th: () => import('./th.json'),
  tr: () => import('./tr.json'),
  vi: () => import('./vi.json'),
  'zh-CN': () => import('./zh-CN.json'),
  'zh-TW': () => import('./zh-TW.json'),
};

const lazyCatalogBackend: BackendModule = {
  type: 'backend',
  init: () => {},
  read: (language, _namespace, callback) => {
    const load = catalogLoaders[language];
    // i18next also asks for base codes (`zh` for `zh-CN`) that ship no catalog.
    if (!load) {
      callback(null, {});
      return;
    }
    load().then(
      (mod) => callback(null, mod.default),
      (error: Error) => callback(error, null),
    );
  },
};

export const i18n: I18nInstance = createInstance({
  lng: 'en',
  fallbackLng: 'en',
  // `ns` is what the backend loads; it defaults to `translation`.
  ns: [NAMESPACE],
  defaultNS: NAMESPACE,
  resources: { en: { [NAMESPACE]: en } },
  // Keep the bundled `en`; every other language goes through the backend.
  partialBundledLanguages: true,
  interpolation: {
    escapeValue: false,
    prefix: '{{',
    suffix: '}}',
  },
  react: {
    transSupportBasicHtmlNodes: true,
    transKeepBasicHtmlNodesFor: ['br', 'strong', 'span', 'code', 'p'],
  },
  nsSeparator: '^',
});

i18n.use(lazyCatalogBackend).use(initReactI18next).init();

const languageLoads = new Map<string, Promise<void>>();

/**
 * Loads BUI's catalog for `lng` without switching to it. One promise per
 * language, so React's `use()` sees the same object on every render.
 */
export const loadBAILanguage = (lng: string): Promise<void> => {
  let pending = languageLoads.get(lng);
  if (!pending) {
    pending = i18n.loadLanguages(lng);
    languageLoads.set(lng, pending);
  }
  return pending;
};

// Dev-only HMR boundary for BUI's locale JSONs. Without it a JSON edit
// re-evaluates this module, and the fresh `i18n` instance orphans the one
// `BAIConfigProvider` already holds. Vite drops this branch in production.
if (import.meta.hot) {
  // TRAP: Vite reads the `accept(deps, cb)` list STATICALLY. A variable
  // reference silently degrades to a self-accept (the orphaning above), so
  // the list MUST stay an inline literal array, in the same order as
  // LANG_BY_FILE (the callback zips them by index).
  const LANG_BY_FILE: Record<string, string> = {
    './de.json': 'de',
    './el.json': 'el',
    './en.json': 'en',
    './es.json': 'es',
    './fi.json': 'fi',
    './fr.json': 'fr',
    './id.json': 'id',
    './it.json': 'it',
    './ja.json': 'ja',
    './ko.json': 'ko',
    './mn.json': 'mn',
    './ms.json': 'ms',
    './pl.json': 'pl',
    './pt-BR.json': 'pt-BR',
    './pt.json': 'pt',
    './ru.json': 'ru',
    './th.json': 'th',
    './tr.json': 'tr',
    './vi.json': 'vi',
    './zh-CN.json': 'zh-CN',
    './zh-TW.json': 'zh-TW',
  };
  import.meta.hot.accept(
    [
      './de.json',
      './el.json',
      './en.json',
      './es.json',
      './fi.json',
      './fr.json',
      './id.json',
      './it.json',
      './ja.json',
      './ko.json',
      './mn.json',
      './ms.json',
      './pl.json',
      './pt-BR.json',
      './pt.json',
      './ru.json',
      './th.json',
      './tr.json',
      './vi.json',
      './zh-CN.json',
      './zh-TW.json',
    ],
    (modules) => {
      if (!modules) return;
      const fileKeys = Object.keys(LANG_BY_FILE);
      let updated = false;
      modules.forEach((mod, idx) => {
        if (!mod) return;
        const lng = LANG_BY_FILE[fileKeys[idx]];
        const data = (mod as unknown as Catalog).default;
        // Overwrite the whole bundle so removed keys disappear too.
        i18n.addResourceBundle(lng, NAMESPACE, data, true, true);
        updated = true;
      });
      // `loaded` is not in react-i18next's default `bindI18n`; re-trigger
      // `languageChanged`, which is, to re-render subscribers.
      if (updated && i18n.language) {
        i18n.changeLanguage(i18n.language);
      }
    },
  );
}

/**
 * The locale a host hands `<BAIConfigProvider locale={…}>`.
 *
 * `astryxLocale` is the flat `@astryx.*` / `uic.*` → string override catalog
 * for the language. The per-language modules under this directory (`ko_KR.ts`,
 * …, the `backend.ai-ui/locale/*` package export) each build one; hosts load
 * the one they need and pass it whole.
 */
export interface BAILocale {
  lang: string;
  astryxLocale?: Record<string, string>;
}
