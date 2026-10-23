import { type BAILocale, loadBAILanguage } from '.';
import astryxLocale from './astryx/th.json';
import { withUiCommonMessages } from './uiCommonMessages';
import 'dayjs/locale/th';

// Start BUI's own catalog now rather than when BAIConfigProvider first asks.
loadBAILanguage('th');

const localeValue: BAILocale = {
  lang: 'th',
  astryxLocale: withUiCommonMessages('th-TH', astryxLocale),
};

export default localeValue;
