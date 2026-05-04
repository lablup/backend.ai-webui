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
import { createInstance, type i18n as I18nInstance } from 'i18next';
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

export const i18n: I18nInstance = createInstance({
  lng: 'en',
  fallbackLng: 'en',
  defaultNS: 'backend.ai-ui',
  resources,
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

i18n.use(initReactI18next).init();

// Dev-only HMR boundary for BUI's own locale JSONs.
//
// BUI keeps its own i18n singleton (separate from the host app — see the
// note in `react/vite.config.ts` about why `i18next`/`react-i18next` are
// excluded from optimizeDeps). Without this boundary, editing a JSON under
// this directory would propagate up the import graph and Vite would
// re-evaluate this module — that creates a fresh `i18n` instance and
// orphans the singleton that `BAIConfigProvider` is already holding, so
// nothing visibly updates.
//
// `import.meta.hot` is dev-only — Vite tree-shakes the entire branch out
// of production builds.
if (import.meta.hot) {
  // IMPORTANT: Vite analyses the `accept(deps, cb)` deps argument STATICALLY
  // (at transform time, not at runtime). Passing a variable reference like
  // `accept(localeFiles, cb)` causes Vite to silently fall back to a plain
  // self-accept, which RE-EVALUATES this module on every JSON change and
  // creates a fresh `i18n` instance — orphaning the singleton that
  // BAIConfigProvider already holds. So the dep list MUST be an inline
  // literal array of string literals.
  //
  // Languages are zipped from the JSON path: `./ko.json` → `ko`. Keep this
  // mapping in `LANG_BY_FILE` so removing the constant doesn't silently
  // change behaviour.
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
  // The path order here MUST match the keys of LANG_BY_FILE above so the
  // index-based zip in the callback stays correct.
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
        const data = (mod as unknown as { default: Record<string, unknown> })
          .default;
        // `deep=true, overwrite=true` — replace the whole bundle for this
        // (lng, ns) so removed keys actually disappear rather than linger.
        i18n.addResourceBundle(lng, 'backend.ai-ui', data, true, true);
        updated = true;
      });
      // `loaded` is not in react-i18next's default `bindI18n` set, so we
      // bounce the language through `changeLanguage` to trigger
      // `languageChanged`, which IS bound and re-renders subscribers.
      if (updated && i18n.language) {
        i18n.changeLanguage(i18n.language);
      }
    },
  );
}

export interface BAILocale {
  lang: string;
  antdLocale: Locale;
}
