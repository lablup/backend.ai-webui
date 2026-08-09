/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
// The `locale` value handed to `<BAIConfigProvider>`, keyed by language code.
//
// This used to be 21 hand-written imports of `backend.ai-ui/dist/locale/*` —
// per-language modules that re-exported antd's own `Locale` bundles so antd's
// `ConfigProvider` could localize its built-in strings (pagination labels,
// date-picker month names). The to-astryx final switch removed the antd
// ConfigProvider layer, so those bundles, that package export and the
// `BAILocale.antdLocale` field are all gone; `BAILocale` now carries only
// `lang`, and BUI forwards it to the three runtimes that still need it (BUI's
// i18next instance, dayjs, Astryx's `InternationalizationProvider`).
//
// BUI's own translation JSONs are NOT re-exported here either. BUI components
// access them via BUI's internal i18next instance (`useBAIi18n` /
// `BAITrans`), so the host has no reason to hold a second copy. See
// FR-2986 / packages/backend.ai-ui/src/hooks/useBAIi18n.ts.
import {
  SUPPORTED_LANGUAGES,
  type SupportedLanguage,
} from './resolveInitialLanguage';
import type { BAILocale } from 'backend.ai-ui';

// languages which are supported by backend.ai-ui.
//
// Derived from `SUPPORTED_LANGUAGES` rather than restated, so the two lists
// cannot drift — the hand-written map this replaces needed a `satisfies
// Record<SupportedLanguage, …>` clause to get the same guarantee, and that
// guarantee is now structural. The `Record` annotation keeps the lookup in
// `DefaultProviders` exhaustively typed.
export const buiLanguages = Object.fromEntries(
  SUPPORTED_LANGUAGES.map((lang) => [lang, { lang } satisfies BAILocale]),
) as Record<SupportedLanguage, BAILocale>;
