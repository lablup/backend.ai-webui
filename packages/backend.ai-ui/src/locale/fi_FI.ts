import { type BAILocale, loadBAILanguage } from '.';
import astryxLocale from './astryx/fi.json';
import { withUiCommonMessages } from './uiCommonMessages';
import 'dayjs/locale/fi';

// Start BUI's own catalog now rather than when BAIConfigProvider first asks.
loadBAILanguage('fi');

const localeValue: BAILocale = {
  lang: 'fi',
  astryxLocale: withUiCommonMessages('fi-FI', astryxLocale),
};

export default localeValue;
