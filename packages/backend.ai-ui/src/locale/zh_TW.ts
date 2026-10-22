import { type BAILocale, loadBAILanguage } from '.';
import astryxLocale from './astryx/zh-TW.json';
import { withUiCommonMessages } from './uiCommonMessages';
import 'dayjs/locale/zh-tw';

// Start BUI's own catalog now rather than when BAIConfigProvider first asks.
loadBAILanguage('zh-TW');

const localeValue: BAILocale = {
  lang: 'zh-TW',
  astryxLocale: withUiCommonMessages('zh-TW', astryxLocale),
};

export default localeValue;
