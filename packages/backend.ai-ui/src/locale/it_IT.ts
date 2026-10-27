import { type BAILocale, loadBAILanguage } from '.';
import astryxLocale from './astryx/it.json';
import { withUiCommonMessages } from './uiCommonMessages';
import 'dayjs/locale/it';

// Start BUI's own catalog now rather than when BAIConfigProvider first asks.
loadBAILanguage('it');

const localeValue: BAILocale = {
  lang: 'it',
  astryxLocale: withUiCommonMessages('it-IT', astryxLocale),
};

export default localeValue;
