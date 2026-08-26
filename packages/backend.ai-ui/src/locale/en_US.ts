import type { BAILocale } from '.';
import en from '@astryxdesign/core/locales/en.json';

// Upstream ships {defaultMessage, description} entries; the override channel
// takes flat strings. Imported from core, not copied — no second source.
// The trailing ellipsis upstream puts on placeholders is dropped here, so
// English matches the translated catalogs in ./astryx/*.json.
const localeValue: BAILocale = {
  lang: 'en',
  astryxLocale: Object.fromEntries(
    Object.entries(en).map(([key, entry]) => [
      key,
      entry.defaultMessage.replace(/(…|\.\.\.)$/, ''),
    ]),
  ),
};

export default localeValue;
