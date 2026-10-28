import type { MessagesByLocale } from '@lablup/ui-common/i18n';
import { uiCommonMessages } from '@lablup/ui-common/i18n-catalog';

/**
 * A locale module's `astryxLocale`: ui-common's `uic.*` strings for one Astryx
 * locale (`ko-KR`, …) flattened to the override channel's plain strings, under
 * the module's own overrides (ADR 0009). A locale ui-common does not translate
 * contributes nothing, so its components fall back to the English
 * `defaultMessage`.
 */
export const withUiCommonMessages = (
  astryxLocaleName: string,
  overrides: Record<string, string> = {},
  messages: MessagesByLocale = uiCommonMessages,
): Record<string, string> => ({
  ...Object.fromEntries(
    Object.entries(messages[astryxLocaleName] ?? {}).map(([key, entry]) => [
      key,
      entry.defaultMessage,
    ]),
  ),
  ...overrides,
});
