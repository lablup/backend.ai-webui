import type { BAILocale } from '.';
import en from '@astryxdesign/core/locales/en.json';

// Upstream ships {defaultMessage, description} entries; the override channel
// takes flat strings. Imported from core, not copied — no second source.
const localeValue: BAILocale = {
  lang: 'en',
  astryxLocale: Object.fromEntries(
    Object.entries(en).map(([key, entry]) => [key, entry.defaultMessage]),
  ),
};

export default localeValue;
