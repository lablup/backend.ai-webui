import { type BAILocale, loadBAILanguage } from '.';
import astryxLocale from './astryx/de.json';
import { withUiCommonMessages } from './uiCommonMessages';
import 'dayjs/locale/de';

// Start BUI's own catalog now rather than when BAIConfigProvider first asks.
loadBAILanguage('de');

const localeValue: BAILocale = {
  lang: 'de',
  astryxLocale: withUiCommonMessages('de-DE', astryxLocale),
};

export default localeValue;
