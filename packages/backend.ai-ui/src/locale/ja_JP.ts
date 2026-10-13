import type { BAILocale } from '.';
import astryxLocale from './astryx/ja.json';
import { withUiCommonMessages } from './uiCommonMessages';

const localeValue: BAILocale = {
  lang: 'ja',
  astryxLocale: withUiCommonMessages('ja-JP', astryxLocale),
};

export default localeValue;
