import type { BAILocale } from '.';
import astryxLocale from './astryx/el.json';
import { withUiCommonMessages } from './uiCommonMessages';

const localeValue: BAILocale = {
  lang: 'el',
  astryxLocale: withUiCommonMessages('el-GR', astryxLocale),
};

export default localeValue;
