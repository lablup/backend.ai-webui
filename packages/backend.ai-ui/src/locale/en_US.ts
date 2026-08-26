import type { BAILocale } from '.';
import astryxOverrides from './astryx/en.json';
import en from '@astryxdesign/core/locales/en.json';

// Upstream ships {defaultMessage, description} entries; the override channel
// takes flat strings. Imported from core, not copied — no second source.
// `./astryx/en.json` then overrides the handful we word differently, the same
// channel the other 20 languages use.
const localeValue: BAILocale = {
  lang: 'en',
  astryxLocale: {
    ...Object.fromEntries(
      Object.entries(en).map(([key, entry]) => [key, entry.defaultMessage]),
    ),
    ...astryxOverrides,
  },
};

export default localeValue;
