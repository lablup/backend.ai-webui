import { type BAILocale, loadBAILanguage } from '.';
import astryxLocale from './astryx/ko.json';
import { withUiCommonMessages } from './uiCommonMessages';
import 'dayjs/locale/ko';

// Start BUI's own catalog now rather than when BAIConfigProvider first asks.
loadBAILanguage('ko');

const localeValue: BAILocale = {
  lang: 'ko',
  astryxLocale: withUiCommonMessages('ko-KR', astryxLocale),
};

export default localeValue;
