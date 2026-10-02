import { MessagesByLocale } from '@lablup/ui-common/i18n';
/**
 * A locale module's `astryxLocale`: ui-common's `uic.*` strings for one Astryx
 * locale (`ko-KR`, …) flattened to the override channel's plain strings, under
 * the module's own overrides (ADR 0009). A locale ui-common does not translate
 * contributes nothing, so its components fall back to the English
 * `defaultMessage`.
 */
export declare const withUiCommonMessages: (astryxLocaleName: string, overrides?: Record<string, string>, messages?: MessagesByLocale) => Record<string, string>;
