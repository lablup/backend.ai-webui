import type { BAILocale } from '.';
import astryxLocale from './astryx/tr.json';
import { withUiCommonMessages } from './uiCommonMessages';

const localeValue: BAILocale = {
  lang: 'tr',
  astryxLocale: withUiCommonMessages('tr-TR', astryxLocale),
};

export default localeValue;
