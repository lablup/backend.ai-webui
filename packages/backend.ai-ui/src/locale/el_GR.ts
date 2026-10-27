import { type BAILocale, loadBAILanguage } from '.';
import astryxLocale from './astryx/el.json';
import { withUiCommonMessages } from './uiCommonMessages';
import 'dayjs/locale/el';

// Start BUI's own catalog now rather than when BAIConfigProvider first asks.
loadBAILanguage('el');

const localeValue: BAILocale = {
  lang: 'el',
  astryxLocale: withUiCommonMessages('el-GR', astryxLocale),
};

export default localeValue;
