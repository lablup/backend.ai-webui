import type { BAILocale } from '.';

// No `astryxLocale`: Astryx and ui-common already fall back to their shipped
// English messages, so an `en` catalog would only add weight to the entry chunk.
const localeValue: BAILocale = {
  lang: 'en',
};

export default localeValue;
