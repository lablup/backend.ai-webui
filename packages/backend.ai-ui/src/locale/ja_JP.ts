import { type BAILocale, loadBAILanguage } from '.';
import astryxLocale from './astryx/ja.json';
import { withUiCommonMessages } from './uiCommonMessages';
import 'dayjs/locale/ja';

// Start BUI's own catalog now rather than when BAIConfigProvider first asks.
loadBAILanguage('ja');

const localeValue: BAILocale = {
  lang: 'ja',
  astryxLocale: withUiCommonMessages('ja-JP', astryxLocale),
};

export default localeValue;
