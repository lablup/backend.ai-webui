/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
// Per-language `BAILocale` modules from BUI for `BAIConfigProvider`'s `locale`
// prop. `en` is bundled for first paint; every other language is its own chunk.
import type { SupportedLanguage } from './resolveInitialLanguage';
import { resolveStoredLanguage } from './storedLanguage';
import type { BAILocale } from 'backend.ai-ui';
import en_US from 'backend.ai-ui/locale/en_US';

type LocaleModule = { default: BAILocale };

// `satisfies` keeps this map in two-way sync with `SUPPORTED_LANGUAGES`:
// a missing or extra key is a type error. Specifiers must stay literal.
export const buiLocaleLoaders = {
  de: () => import('backend.ai-ui/locale/de_DE'),
  el: () => import('backend.ai-ui/locale/el_GR'),
  en: () => Promise.resolve({ default: en_US }),
  es: () => import('backend.ai-ui/locale/es_ES'),
  fi: () => import('backend.ai-ui/locale/fi_FI'),
  fr: () => import('backend.ai-ui/locale/fr_FR'),
  id: () => import('backend.ai-ui/locale/id_ID'),
  it: () => import('backend.ai-ui/locale/it_IT'),
  ja: () => import('backend.ai-ui/locale/ja_JP'),
  ko: () => import('backend.ai-ui/locale/ko_KR'),
  mn: () => import('backend.ai-ui/locale/mn_MN'),
  ms: () => import('backend.ai-ui/locale/ms_MY'),
  pl: () => import('backend.ai-ui/locale/pl_PL'),
  'pt-BR': () => import('backend.ai-ui/locale/pt_BR'),
  pt: () => import('backend.ai-ui/locale/pt_PT'),
  ru: () => import('backend.ai-ui/locale/ru_RU'),
  th: () => import('backend.ai-ui/locale/th_TH'),
  tr: () => import('backend.ai-ui/locale/tr_TR'),
  vi: () => import('backend.ai-ui/locale/vi_VN'),
  'zh-CN': () => import('backend.ai-ui/locale/zh_CN'),
  'zh-TW': () => import('backend.ai-ui/locale/zh_TW'),
} satisfies Record<SupportedLanguage, () => Promise<LocaleModule>>;

const isLoadableLanguage = (
  lang: string,
): lang is keyof typeof buiLocaleLoaders =>
  Object.prototype.hasOwnProperty.call(buiLocaleLoaders, lang);

const loadedLocales = new Map<string, BAILocale>([['en', en_US]]);
const pendingLocales = new Map<string, Promise<BAILocale>>([
  ['en', Promise.resolve(en_US)],
]);

/** The locale for `lang` if it has already loaded; `en` always has. */
export const getLoadedBuiLocale = (lang: string): BAILocale | undefined =>
  loadedLocales.get(lang);

/**
 * Loads the locale for `lang`, falling back to `en` for an unsupported code or
 * a failed chunk. One promise per language, so React's `use()` can suspend on it.
 */
export const loadBuiLocale = (lang: string): Promise<BAILocale> => {
  const cached = pendingLocales.get(lang);
  if (cached) return cached;
  const pending = (
    isLoadableLanguage(lang)
      ? buiLocaleLoaders[lang]().then((mod) => mod.default)
      : Promise.resolve(en_US)
  )
    .catch(() => en_US)
    .then((locale) => {
      loadedLocales.set(lang, locale);
      return locale;
    });
  pendingLocales.set(lang, pending);
  return pending;
};

export const preloadBuiLocale = (lang: string): void => {
  void loadBuiLocale(lang);
};

// Start the stored language's chunk in parallel with the host catalog fetch.
preloadBuiLocale(resolveStoredLanguage());
