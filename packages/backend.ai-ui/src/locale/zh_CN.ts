import type { BAILocale } from '.';
import astryxLocale from './astryx/zh-CN.json';
import { withUiCommonMessages } from './uiCommonMessages';

const localeValue: BAILocale = {
  lang: 'zh-CN',
  astryxLocale: withUiCommonMessages('zh-CN', astryxLocale),
};

export default localeValue;
