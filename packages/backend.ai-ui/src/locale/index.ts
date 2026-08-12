import de from './de.json';
import de_DE from './de_DE';
import el from './el.json';
import el_GR from './el_GR';
import en from './en.json';
import en_US from './en_US';
import es from './es.json';
import es_ES from './es_ES';
import fi from './fi.json';
import fi_FI from './fi_FI';
import fr from './fr.json';
import fr_FR from './fr_FR';
import id from './id.json';
import id_ID from './id_ID';
import it from './it.json';
import it_IT from './it_IT';
import ja from './ja.json';
import ja_JP from './ja_JP';
import ko from './ko.json';
import ko_KR from './ko_KR';
import mn from './mn.json';
import mn_MN from './mn_MN';
import ms from './ms.json';
import ms_MY from './ms_MY';
import pl from './pl.json';
import pl_PL from './pl_PL';
import pt_BR from './pt-BR.json';
import pt from './pt.json';
import pt_BR_locale from './pt_BR';
import pt_PT from './pt_PT';
import ru from './ru.json';
import ru_RU from './ru_RU';
import th from './th.json';
import th_TH from './th_TH';
import tr from './tr.json';
import tr_TR from './tr_TR';
import vi from './vi.json';
import vi_VN from './vi_VN';
import zh_CN from './zh-CN.json';
import zh_TW from './zh-TW.json';
import zh_CN_locale from './zh_CN';
import zh_TW_locale from './zh_TW';
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

/**
 * The locale a host hands `<BAIConfigProvider locale={…}>`.
 *
 * `astryxLocale` is the flat `@astryx.*` → string catalog for the language
 * (`./astryx/*.json`, carried by the per-language modules `ko_KR.ts`, …).
 * Hosts normally pass only `lang`; `BAIConfigProvider` resolves the catalog
 * from `baiLocales` and feeds it to Astryx's `InternationalizationProvider`.
 */
export interface BAILocale {
  lang: string;
  astryxLocale?: Record<string, string>;
}

/**
 * Every `BAILocale` BUI ships, keyed by language code. Internal to the
 * package — the astryx catalogs are not part of the public API.
 */
export const baiLocales: Record<string, BAILocale> = {
  de: de_DE,
  el: el_GR,
  en: en_US,
  es: es_ES,
  fi: fi_FI,
  fr: fr_FR,
  id: id_ID,
  it: it_IT,
  ja: ja_JP,
  ko: ko_KR,
  mn: mn_MN,
  ms: ms_MY,
  pl: pl_PL,
  'pt-BR': pt_BR_locale,
  pt: pt_PT,
  ru: ru_RU,
  th: th_TH,
  tr: tr_TR,
  vi: vi_VN,
  'zh-CN': zh_CN_locale,
  'zh-TW': zh_TW_locale,
};
