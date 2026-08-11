/**
 * P13 — the single language source of truth for Astryx components.
 *
 * ## The problem this closes
 *
 * Three translation runtimes coexisted in a running app:
 *
 *   1. the HOST's i18next (`react/src/i18n.ts`),
 *   2. BUI's own i18next instance (FR-2986 — bound explicitly via
 *      `useBAIi18n` / `<BAITrans>` so BUI never resolves against the host's
 *      React context), and
 *   3. Astryx's built-in resolver (`@astryxdesign/core/i18n`), which nobody
 *      configured.
 *
 * (3) was not merely untranslated. Without an `InternationalizationProvider`
 * the context default is `{locale: 'en', direction: 'ltr'}`, and that locale is
 * what Astryx hands to `IntlMessageFormat` — so every plural, number and date
 * an Astryx component formatted was formatted as English, in an app that had
 * just switched to Korean. `getLocaleDirection` was likewise never consulted.
 *
 * The fix is NOT a fourth catalog. `BAIConfigProvider` already owns the one
 * place a language change lands (it drives `buiI18n.changeLanguage` and
 * `dayjs.locale`); ticket 30 makes it drive Astryx's locale from the same
 * effect, and routes any Astryx string we want to translate through BUI's
 * EXISTING catalogs rather than a parallel one.
 *
 * ## The override channel
 *
 * Astryx keys are namespaced `@astryx.<component>.<name>` and its shipped `en`
 * catalog is always the final fallback (see `resolve.ts` upstream). To
 * translate one, add it under an `astryx` object in the matching BUI locale
 * JSON:
 *
 *     // src/locale/ko.json
 *     {
 *       "astryx": {
 *         "@astryx.pagination.next": "다음 페이지로 이동"
 *       }
 *     }
 *
 * `buildAstryxOverrides` lifts that subtree into the `Overrides` shape the
 * provider takes. Keys absent from a locale fall through to Astryx's English —
 * the same behaviour as before, so the subtree can stay empty (it is, today)
 * and grow one key at a time. This is the documented path ticket 28 deferred
 * here for the PowerSearch / Typeahead chrome strings (typeahead empty state,
 * token remove and clear-all labels, date editor labels, operator menu aria).
 */
import type { Overrides } from '@astryxdesign/core/i18n';
import type { i18n as I18nInstance } from 'i18next';

/** The BUI namespace every locale bundle is registered under. */
const BUI_NAMESPACE = 'backend.ai-ui';

/** The reserved key inside a BUI locale bundle that holds Astryx overrides. */
const ASTRYX_SUBTREE = 'astryx';

/**
 * Build Astryx's `overrides` for one language out of BUI's own catalog.
 *
 * Scoped to the active language on purpose: `Overrides` is locale-keyed, and
 * emitting every language's subtree would hand the provider a new object
 * identity holding 21 unused catalogs on every language change.
 *
 * Returns `undefined` — not `{}` — when there is nothing to override, so the
 * provider's `useMemo` value stays referentially stable across renders for the
 * (current) common case of an empty subtree.
 */
export function buildAstryxOverrides(
  i18n: I18nInstance,
  lng: string,
): Overrides | undefined {
  // `getResourceBundle` returns undefined for a language that was never
  // registered (BUI ships 21, the host may ask for something else).
  const bundle = i18n.getResourceBundle(lng, BUI_NAMESPACE) as
    Record<string, unknown> | undefined;
  const subtree = bundle?.[ASTRYX_SUBTREE];
  if (!subtree || typeof subtree !== 'object') return undefined;

  const entries = Object.entries(subtree as Record<string, unknown>).filter(
    (entry): entry is [string, string] => typeof entry[1] === 'string',
  );
  if (entries.length === 0) return undefined;

  return { [lng]: Object.fromEntries(entries) };
}
