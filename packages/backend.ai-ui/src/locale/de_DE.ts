import type { BAILocale } from '.';
import astryxLocale from './astryx/de.json';
import { withUiCommonMessages } from './uiCommonMessages';

const localeValue: BAILocale = {
  lang: 'de',
  astryxLocale: withUiCommonMessages('de-DE', astryxLocale),
};

export default localeValue;
