import { i18n as I18nInstance } from 'i18next';
export declare const i18n: I18nInstance;
/**
 * The locale a host hands `<BAIConfigProvider locale={…}>`.
 *
 * `astryxLocale` is the flat `@astryx.*` → string catalog for the language.
 * The per-language modules under this directory (`ko_KR.ts`, …, published as
 * the `backend.ai-ui/locale/*` package export) each bundle their
 * `./astryx/*.json` catalog into this shape — the host imports one and passes
 * it whole, exactly like the antd-era `antdLocale` flow this replaces.
 */
export interface BAILocale {
    lang: string;
    astryxLocale?: Record<string, string>;
}
