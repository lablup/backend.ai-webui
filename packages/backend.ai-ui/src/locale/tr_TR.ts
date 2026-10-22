import { type BAILocale, loadBAILanguage } from '.';
import astryxLocale from './astryx/tr.json';
import { withUiCommonMessages } from './uiCommonMessages';
import 'dayjs/locale/tr';

// Start BUI's own catalog now rather than when BAIConfigProvider first asks.
loadBAILanguage('tr');

const localeValue: BAILocale = {
  lang: 'tr',
  astryxLocale: withUiCommonMessages('tr-TR', astryxLocale),
};

export default localeValue;
