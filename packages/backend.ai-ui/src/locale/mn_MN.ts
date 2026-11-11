import { type BAILocale, loadBAILanguage } from '.';
import astryxLocale from './astryx/mn.json';
import { withUiCommonMessages } from './uiCommonMessages';
import 'dayjs/locale/mn';

// Start BUI's own catalog now rather than when BAIConfigProvider first asks.
loadBAILanguage('mn');

const localeValue: BAILocale = {
  lang: 'mn',
  astryxLocale: withUiCommonMessages('mn-MN', astryxLocale),
};

export default localeValue;
