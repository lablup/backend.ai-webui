import type { BAILocale } from '.';

// No full `en` catalog: Astryx and ui-common already fall back to their shipped
// English messages, so only the strings BUI overrides are listed.
const localeValue: BAILocale = {
  lang: 'en',
  astryxLocale: {
    // A row's remove action reads just "Remove", like the other locales.
    '@astryx.listInput.removeItem': 'Remove',
  },
};

export default localeValue;
