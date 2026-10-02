import type { BAILocale } from '.';
import astryxLocale from './astryx/ko.json';
import { withUiCommonMessages } from './uiCommonMessages';

const localeValue: BAILocale = {
  lang: 'ko',
  astryxLocale: withUiCommonMessages('ko-KR', astryxLocale),
};

export default localeValue;
