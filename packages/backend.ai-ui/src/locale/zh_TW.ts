import type { BAILocale } from '.';
import astryxLocale from './astryx/zh-TW.json';
import { withUiCommonMessages } from './uiCommonMessages';

const localeValue: BAILocale = {
  lang: 'zh-TW',
  astryxLocale: withUiCommonMessages('zh-TW', astryxLocale),
};

export default localeValue;
