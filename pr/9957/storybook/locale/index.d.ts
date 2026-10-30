import { i18n as I18nInstance } from 'i18next';
export declare const i18n: I18nInstance;
/**
 * Loads BUI's catalog for `lng` without switching to it. One promise per
 * language, so React's `use()` sees the same object on every render.
 */
export declare const loadBAILanguage: (lng: string) => Promise<void>;
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
