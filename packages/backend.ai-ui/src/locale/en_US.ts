import type { BAILocale } from '.';
import { withUiCommonMessages } from './uiCommonMessages';
import en from '@lablup/ui-common/locales/en.json';

// Upstream ships {defaultMessage, description} entries; the override channel
// takes flat strings. Imported from core, not copied — no second source.
const localeValue: BAILocale = {
  lang: 'en',
  astryxLocale: withUiCommonMessages(
    'en',
    Object.fromEntries(
      Object.entries(en).map(([key, entry]) => [key, entry.defaultMessage]),
    ),
  ),
};

export default localeValue;
