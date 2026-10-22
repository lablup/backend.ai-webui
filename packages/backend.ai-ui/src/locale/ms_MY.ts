import { type BAILocale, loadBAILanguage } from '.';
import astryxLocale from './astryx/ms.json';
import { withUiCommonMessages } from './uiCommonMessages';
import 'dayjs/locale/ms';

// Start BUI's own catalog now rather than when BAIConfigProvider first asks.
loadBAILanguage('ms');

const localeValue: BAILocale = {
  lang: 'ms',
  astryxLocale: withUiCommonMessages('ms-MY', astryxLocale),
};

export default localeValue;
