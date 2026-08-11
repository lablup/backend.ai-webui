/**
 * The locale toolbar's language list.
 *
 * This file used to also export `antdLocaleMap` / `getAntdLocale` — 21
 * `antd/locale/*` bundles keyed by language, which `decorators.tsx` fed to
 * `BAIConfigProvider`'s antd `ConfigProvider` leg so antd's built-in strings
 * (pagination, date picker) followed the story's locale. The to-astryx final
 * switch removed that provider; `BAILocale` now carries only `lang`, and BUI's
 * own catalogs plus Astryx's `InternationalizationProvider` cover every string
 * a story renders. The list below is unchanged and stays the single source for
 * the toolbar (`preview.tsx`).
 */
export const localeItems = [
  { value: 'en', title: 'English' },
  { value: 'ko', title: '한국어' },
  { value: 'ja', title: '日本語' },
  { value: 'zh-CN', title: '简体中文' },
  { value: 'zh-TW', title: '繁體中文' },
  { value: 'de', title: 'Deutsch' },
  { value: 'fr', title: 'Français' },
  { value: 'es', title: 'Español' },
  { value: 'pt', title: 'Português' },
  { value: 'pt-BR', title: 'Português (Brasil)' },
  { value: 'it', title: 'Italiano' },
  { value: 'ru', title: 'Русский' },
  { value: 'pl', title: 'Polski' },
  { value: 'el', title: 'Ελληνικά' },
  { value: 'fi', title: 'Suomi' },
  { value: 'tr', title: 'Türkçe' },
  { value: 'th', title: 'ไทย' },
  { value: 'vi', title: 'Tiếng Việt' },
  { value: 'id', title: 'Indonesia' },
  { value: 'ms', title: 'Melayu' },
  { value: 'mn', title: 'Монгол' },
];
