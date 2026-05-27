/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */

/**
 * The list of language codes the WebUI ships translations for. Used both at
 * i18n initialization time (`DefaultProviders.tsx`) and inside `LoginView` to
 * normalize a stored / browser-reported locale to one the app actually
 * supports.
 *
 * Keep this list in sync with the translation files under
 * `resources/i18n/*.json` and with `packages/backend.ai-ui/src/locale/`.
 */
export const SUPPORTED_LANGUAGES = [
  'en',
  'ko',
  'de',
  'el',
  'es',
  'fi',
  'fr',
  'id',
  'it',
  'ja',
  'mn',
  'ms',
  'pl',
  'pt',
  'pt-BR',
  'ru',
  'th',
  'tr',
  'vi',
  'zh-CN',
  'zh-TW',
] as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

const SUPPORTED_SET: ReadonlySet<string> = new Set(SUPPORTED_LANGUAGES);

const isSupported = (code: string): code is SupportedLanguage =>
  SUPPORTED_SET.has(code);

/**
 * Returns `true` if the given value names a real, supported language. The
 * literal string `'default'` is treated as "no choice" — it is a sentinel
 * value used by the legacy settings store, not a valid IETF locale.
 */
const isExplicitSupportedChoice = (
  value: string | null | undefined,
): value is SupportedLanguage =>
  typeof value === 'string' &&
  value.length > 0 &&
  value !== 'default' &&
  isSupported(value);

/**
 * Picks the best supported language for the current browser by trying the
 * full locale first (e.g. `zh-CN`), then the base language (e.g. `zh`), and
 * finally falling back to `en`. SSR-safe: returns `'en'` when `navigator`
 * is not defined.
 */
export const detectBrowserLanguage = (): SupportedLanguage => {
  if (typeof navigator === 'undefined') {
    return 'en';
  }
  const browserLang = navigator.language;
  if (!browserLang) {
    return 'en';
  }
  if (isSupported(browserLang)) {
    return browserLang;
  }
  const baseLang = browserLang.split('-')[0];
  if (isSupported(baseLang)) {
    return baseLang;
  }
  return 'en';
};

/**
 * Resolves the initial language for i18next. If the caller passes an
 * explicit, supported choice (typically read from the persisted
 * `general.language` setting), that wins. Otherwise we fall back to the
 * browser-detected language so that first-paint screens — most notably the
 * login page — render in the user's language even when nothing has been
 * persisted yet (e.g. private / incognito browsing).
 */
export const resolveInitialLanguage = (
  storedValue?: string | null,
): SupportedLanguage => {
  if (isExplicitSupportedChoice(storedValue)) {
    return storedValue;
  }
  return detectBrowserLanguage();
};
