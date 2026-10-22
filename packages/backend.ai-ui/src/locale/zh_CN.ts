import { type BAILocale, loadBAILanguage } from '.';
import astryxLocale from './astryx/zh-CN.json';
import { withUiCommonMessages } from './uiCommonMessages';
import 'dayjs/locale/zh-cn';

// Start BUI's own catalog now rather than when BAIConfigProvider first asks.
loadBAILanguage('zh-CN');

const localeValue: BAILocale = {
  lang: 'zh-CN',
  astryxLocale: withUiCommonMessages('zh-CN', astryxLocale),
};

export default localeValue;
