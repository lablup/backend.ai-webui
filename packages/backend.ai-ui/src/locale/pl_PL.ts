import { type BAILocale, loadBAILanguage } from '.';
import astryxLocale from './astryx/pl.json';
import { withUiCommonMessages } from './uiCommonMessages';
import 'dayjs/locale/pl';

// Start BUI's own catalog now rather than when BAIConfigProvider first asks.
loadBAILanguage('pl');

const localeValue: BAILocale = {
  lang: 'pl',
  astryxLocale: withUiCommonMessages('pl-PL', astryxLocale),
};

export default localeValue;
